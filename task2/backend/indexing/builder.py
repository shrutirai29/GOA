"""Offline index builder.

Pipeline (all of this runs *before* the service starts):

    parquet shard ──▶ corpus (dedupe, cap) ──▶ per-strategy chunking
        ──▶ dense vectors (FAISS) + BM25 + metadata registry
        ──▶ persisted under data/indexes/<view>/

Nothing here runs at query time.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from backend.chunking import (
    Chunk,
    ChunkingRouter,
    FixedTokenChunker,
    HierarchicalChunker,
    SemanticChunker,
    SentenceChunker,
)
from backend.config import settings
from backend.indexing.bm25_index import Bm25Index
from backend.indexing.embeddings import Embedder
from backend.indexing.metadata_index import MetadataIndex
from backend.indexing.vector_index import VectorIndex

# settings.lang -> target_lang value in the dataset (shard-partitioned)
LANG_TO_TARGET: dict[str, str] = {
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "as": "asm_Beng",
    "gu": "guj_Gujr",
    "mr": "mar_Deva",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "pa": "pan_Guru",
    "ur": "urd_Arab",
    "or": "ori_Orya",
    "en": "eng_Latn",
}


@dataclass
class CorpusDocument:
    document_id: str
    text: str
    language: str = "hi"


@dataclass
class EvalQuery:
    query_id: str
    query: str
    query_type: str
    answer: str
    gold_passage_ids: list[str] = field(default_factory=list)


class IndexBuilder:
    """Builds the knowledge base + all retrieval views."""

    def __init__(self, embedder: Embedder | None = None) -> None:
        self.embedder = embedder or Embedder()
        self.chunkers = {
            "fixed": FixedTokenChunker(),
            "sentence": SentenceChunker(),
            "semantic": SemanticChunker(embedder=self.embedder),
            "hierarchical": HierarchicalChunker(),
        }

    # ------------------------------------------------------------ corpus
    @staticmethod
    def build_corpus_from_shard(
        shard_path: Path,
        lang: str = "hi",
        max_passages: int = 25_000,
        max_queries: int = 500,
    ) -> tuple[list[CorpusDocument], list[EvalQuery]]:
        """Read a local parquet shard, dedupe passages and extract queries
        with gold relevance labels (``is_selected``)."""
        import pyarrow.parquet as pq

        target = LANG_TO_TARGET.get(lang)
        if target is None:
            raise ValueError(f"unsupported lang {lang!r}; choose from {sorted(LANG_TO_TARGET)}")

        df = pq.ParquetFile(shard_path).read().to_pandas()
        if target in df["target_lang"].unique():
            df = df[df["target_lang"] == target]
        else:
            print(f"  [corpus] shard has no {target} rows; using all rows (lang mismatch)")

        # ---- corpus: unique passages (normalised-dedupe) up to cap
        text_to_id: dict[str, str] = {}
        documents: list[CorpusDocument] = []
        for _, row in df.iterrows():
            for p in row["passages"]["Translated_passages"]:
                if len(documents) >= max_passages:
                    break
                norm = " ".join(str(p).split())
                if not norm or norm in text_to_id:
                    continue
                pid = f"P{len(documents) + 1:06d}"
                text_to_id[norm] = pid
                documents.append(CorpusDocument(document_id=pid, text=str(p), language=lang))
            if len(documents) >= max_passages:
                break

        # ---- queries with gold passages present in the corpus
        queries: list[EvalQuery] = []
        for _, row in df.iterrows():
            if len(queries) >= max_queries:
                break
            ps = row["passages"]
            selected = [int(s) for s in ps["is_selected"]]
            gold_ids: list[str] = []
            for i, s in enumerate(selected):
                if s and i < len(ps["Translated_passages"]):
                    pid = text_to_id.get(" ".join(str(ps["Translated_passages"][i]).split()))
                    if pid:
                        gold_ids.append(pid)
            if not gold_ids:
                continue
            queries.append(
                EvalQuery(
                    query_id=str(row["query_id"]),
                    query=str(row["query"]),
                    query_type=str(row["query_type"]),
                    answer=str(row["Answer"]),
                    gold_passage_ids=gold_ids,
                )
            )
        print(f"  [corpus] documents={len(documents)} queries={len(queries)}")
        return documents, queries

    @staticmethod
    def save_corpus(documents: list[CorpusDocument], queries: list[EvalQuery]) -> None:
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        with open(settings.corpus_path, "w", encoding="utf-8") as f:
            for d in documents:
                f.write(json.dumps({"document_id": d.document_id, "text": d.text, "language": d.language}, ensure_ascii=False) + "\n")
        with open(settings.queries_path, "w", encoding="utf-8") as f:
            for q in queries:
                f.write(
                    json.dumps(
                        {
                            "query_id": q.query_id,
                            "query": q.query,
                            "query_type": q.query_type,
                            "answer": q.answer,
                            "gold_passage_ids": q.gold_passage_ids,
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
        print(f"  [corpus] saved {len(documents)} docs -> {settings.corpus_path}")
        print(f"  [corpus] saved {len(queries)} queries -> {settings.queries_path}")

    @staticmethod
    def load_corpus() -> tuple[list[CorpusDocument], list[EvalQuery]]:
        documents: list[CorpusDocument] = []
        for line in settings.corpus_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                d = json.loads(line)
                # Only pass known fields to CorpusDocument
                documents.append(CorpusDocument(
                    document_id=d["document_id"],
                    text=d["text"],
                    language=d.get("language", "multi"),
                ))
        queries: list[EvalQuery] = []
        if settings.queries_path.exists():
            for line in settings.queries_path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    q = json.loads(line)
                    queries.append(EvalQuery(**q))
        return documents, queries

    # ------------------------------------------------------------ views
    def build_view(self, view: str, documents: list[CorpusDocument]) -> None:
        """Build (or resume) one retrieval view.

        The view is written incrementally: chunk metadata and the FAISS index
        are persisted after every embedding batch, so an interrupted run can
        simply be re-invoked and it resumes where it left off.
        """
        out = settings.index_dir / view
        out.mkdir(parents=True, exist_ok=True)

        chunker = self.chunkers[view]

        # 1. chunks (deterministic order; resume skips already-chunked docs)
        meta = MetadataIndex.load(out) if (out / "chunks.jsonl").exists() else MetadataIndex()
        done_docs = {c.document_id for c in meta.chunks.values()}
        missing = [d for d in documents if d.document_id not in done_docs]
        print(f"  [{view}] chunking {len(missing)}/{len(documents)} documents ...", flush=True)
        new_chunks: list[Chunk] = []

        if view == "semantic" and missing:
            # Bulk sentence embedding, batched + checkpointed: embed the
            # sentences of a batch of documents in one sorted call (per-doc
            # calls are dominated by call overhead on CPU), chunk, then persist
            # so an interrupted run resumes without re-embedding.
            from backend.chunking.base import sentence_split

            batch_docs = 300
            for bi in range(0, len(missing), batch_docs):
                mb = missing[bi : bi + batch_docs]
                pairs: list[tuple[str, str]] = []
                counts: dict[str, int] = {}
                for d in mb:
                    ss = sentence_split(d.text)
                    counts[d.document_id] = len(ss)
                    pairs.extend((d.document_id, s) for s in ss)
                vecs = self.embedder.encode_passages([s for _, s in pairs], batch_size=64)
                pos = 0
                for d in mb:
                    n = counts[d.document_id]
                    new_chunks.extend(
                        chunker.chunk(d.document_id, d.text, d.language, sentence_vectors=vecs[pos : pos + n])
                    )
                    pos += n
                    meta.add_document(d.document_id, d.text)
                for c in new_chunks:
                    meta.add_chunk(c)
                meta.save(out)  # checkpoint
                print(f"    [semantic] sentence-chunked {min(bi + batch_docs, len(missing))}/{len(missing)} docs", flush=True)
                new_chunks = []
        else:
            for d in missing:
                new_chunks.extend(chunker.chunk(d.document_id, d.text, d.language))
                meta.add_document(d.document_id, d.text)
        for c in new_chunks:
            meta.add_chunk(c)
        # persist chunks so resuming only re-embeds what is missing
        meta.save(out)
        all_chunks = list(meta.chunks.values())
        print(f"  [{view}] total chunks: {len(all_chunks)} (+{len(new_chunks)} new)", flush=True)

        # 2. dense embeddings, appended + saved batch by batch
        vec = VectorIndex.load(out) if (out / "faiss.index").exists() else VectorIndex(self.embedder.dim)
        embedded = set(vec.ids)
        to_embed = [c for c in all_chunks if c.chunk_id not in embedded]
        print(f"  [{view}] embedding {len(to_embed)} chunks ({len(embedded)} done) ...", flush=True)
        batch = 512
        for start in range(0, len(to_embed), batch):
            part = to_embed[start : start + batch]
            vectors = self.embedder.encode_passages([c.text for c in part], batch_size=64)
            vec.add(vectors, [c.chunk_id for c in part])
            vec.save(out)  # incremental checkpoint
            meta.save(out)
            print(f"    [{view}] embedded {min(start + batch, len(to_embed))}/{len(to_embed)}", flush=True)

        # 3. BM25 over final chunks
        print(f"  [{view}] building BM25 over {len(all_chunks)} chunks ...", flush=True)
        bm25 = Bm25Index()
        bm25.build([c.text for c in all_chunks])
        bm25.save(out)

        meta.save(out)
        print(f"  [{view}] complete -> {out}", flush=True)

    def build(self, views: list[str] | None = None) -> None:
        views = views or list(self.chunkers)
        documents, queries = self.load_corpus()
        if not documents:
            raise RuntimeError(f"no corpus at {settings.corpus_path} — run build_index.py with --shard first")
        for view in views:
            self.build_view(view, documents)
        # save an overview
        overview = {
            "views": views,
            "documents": len(documents),
            "queries": len(queries),
            "chunkers": {
                v: {
                    "class": type(self.chunkers[v]).__name__,
                    "params": getattr(self.chunkers[v], "__dict__", {}),
                }
                for v in views
            },
        }
        settings.index_dir.mkdir(parents=True, exist_ok=True)
        (settings.index_dir / "overview.json").write_text(json.dumps(overview, indent=2, default=str), encoding="utf-8")
        print("[index] overview saved")
