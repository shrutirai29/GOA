"""Retrieval layer: dense (FAISS) + sparse (BM25) + hybrid RRF fusion.

Each persisted *view* (fixed / sentence / semantic / hierarchical) bundles a
FAISS index, a BM25 index and a metadata registry. Views are loaded lazily and
cached in memory — nothing is rebuilt at query time.

Fusion uses Reciprocal Rank Fusion (RRF)::

    score(chunk) = Σ_lists 1 / (rrf_k + rank)

RRF is robust to incomparable score scales between dense and sparse
retrievers and needs no calibration, which is why it was chosen over
score-normalisation fusion.
"""

from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from backend.config import settings
from backend.indexing.bm25_index import Bm25Index
from backend.indexing.embeddings import Embedder
from backend.indexing.metadata_index import MetadataIndex
from backend.indexing.vector_index import VectorIndex
from backend.models import QueryInfo, RetrievedChunk, RetrievalResult


@dataclass
class _View:
    name: str
    vector: VectorIndex
    bm25: Bm25Index
    metadata: MetadataIndex
    chunk_order: list[str] = field(default_factory=list)


def rrf_fuse(
    ranked_lists: list[list[tuple[str, float]]],
    k: int,
    weights: list[float] | None = None,
) -> list[tuple[str, float]]:
    """Fuse ranked lists of (item_id, score) with RRF, optionally weighted."""
    weights = weights or [1.0] * len(ranked_lists)
    acc: dict[str, float] = {}
    for lst, w in zip(ranked_lists, weights):
        for rank, (item_id, _score) in enumerate(lst):
            acc[item_id] = acc.get(item_id, 0.0) + w / (k + rank + 1)
    return sorted(acc.items(), key=lambda kv: kv[1], reverse=True)


class Retriever:
    """Hybrid retriever over persisted index views.

    ``view_names=None`` loads every view that exists on disk; ``view_names``
    restricts to a subset (useful in tests and low-memory deployments).
    """

    def __init__(
        self,
        view_names: list[str] | None = None,
        embedder: Embedder | None = None,
        index_dir: Path | None = None,
    ) -> None:
        self.embedder = embedder
        self.index_dir = index_dir or settings.index_dir
        self.lightweight = settings.lightweight_mode
        self.views: dict[str, _View] = {}
        candidates = view_names or ["fixed", "sentence", "semantic", "hierarchical"]
        for name in candidates:
            d = self.index_dir / name
            if self.lightweight:
                # Lightweight mode: skip FAISS indexes, only load BM25 + metadata
                if not (d / "bm25.pkl").exists():
                    continue
                meta = MetadataIndex.load(d)
                self.views[name] = _View(
                    name=name,
                    vector=None,  # type: ignore[arg-type]
                    bm25=Bm25Index.load(d),
                    metadata=meta,
                    chunk_order=[c.chunk_id for c in meta.chunks.values()],
                )
            else:
                if not (d / "faiss.index").exists():
                    continue
                meta = MetadataIndex.load(d)
                self.views[name] = _View(
                    name=name,
                    vector=VectorIndex.load(d),
                    bm25=Bm25Index.load(d),
                    metadata=meta,
                    chunk_order=[c.chunk_id for c in meta.chunks.values()],
                )

    # ------------------------------------------------------------------ misc
    @property
    def available_views(self) -> list[str]:
        return sorted(self.views)

    def _lazy_embedder(self) -> Embedder:
        if self.embedder is None:
            self.embedder = Embedder()
        return self.embedder

    # ---------------------------------------------------------------- dense
    def _dense_search(self, view: _View, query: str, k: int) -> list[tuple[str, float]]:
        if self.lightweight or view.vector is None:
            return []
        vec = self._lazy_embedder().encode_query(query)
        ids, scores = view.vector.search(vec, k)
        return list(zip(ids, scores))

    # ---------------------------------------------------------------- bm25
    def _bm25_search(self, view: _View, query: str, k: int) -> list[tuple[str, float]]:
        hits = view.bm25.search(query, k)
        # BM25 positional ids align with the chunk order the index was built over
        ids = [view.chunk_order[i] for i, _ in hits]
        return list(zip(ids, [s for _, s in hits]))

    # ------------------------------------------------------------- retrieve
    def retrieve(self, query: str, query_info: QueryInfo) -> RetrievalResult:
        t0 = time.perf_counter()
        view_name = query_info.chunk_strategy
        view = self.views.get(view_name) or next(iter(self.views.values()))
        timings: dict[str, float] = {}

        # pathologically long queries (dataset artifacts of thousands of chars)
        # blow up BM25 cost and carry no retrieval signal → truncate for search.
        search_text = query[: settings.query_max_chars]

        if self.lightweight:
            # Lightweight mode: BM25 only, skip all dense/embedding work
            dense_top = False
            bm25_top = True
        else:
            dense_top = query_info.retrieval_mode in ("dense", "hybrid")
            bm25_top = query_info.retrieval_mode in ("bm25", "hybrid")

        ranked_lists: list[list[tuple[str, float]]] = []
        weights: list[float] = []
        raw: dict[str, object] = {}

        # hybrid mode runs dense + BM25 concurrently: the embedder's torch/
        # faiss work releases the GIL, so the pure-Python BM25 loop overlaps
        # with it instead of paying both latencies serially.
        if dense_top and bm25_top:
            td = time.perf_counter()
            with ThreadPoolExecutor(max_workers=2) as ex:
                fd = ex.submit(self._dense_search, view, search_text, settings.dense_top_k)
                fb = ex.submit(self._bm25_search, view, search_text, settings.bm25_top_k)
                dense = fd.result()
                bm25 = fb.result()
            timings["dense"] = (time.perf_counter() - td) * 1000
            timings["bm25"] = (time.perf_counter() - td) * 1000  # overlapped
            ranked_lists.append(dense)
            ranked_lists.append(bm25)
            weights.append(1.0)
            # ENTITY / PERSON / LOCATION queries rely on exact terms → boost
            # the lexical list so spelling-exact matches win.
            weights.append(1.6 if query_info.needs_metadata_filter else 1.0)
            raw["dense"] = dense
            raw["bm25"] = bm25
        else:
            if dense_top:
                td = time.perf_counter()
                dense = self._dense_search(view, search_text, settings.dense_top_k)
                timings["dense"] = (time.perf_counter() - td) * 1000
                ranked_lists.append(dense)
                weights.append(1.0)
                raw["dense"] = dense

            if bm25_top:
                tb = time.perf_counter()
                bm25 = self._bm25_search(view, search_text, settings.bm25_top_k)
                timings["bm25"] = (time.perf_counter() - tb) * 1000
                ranked_lists.append(bm25)
                # ENTITY / PERSON / LOCATION queries rely on exact terms → boost
                # the lexical list so spelling-exact matches win.
                boost = 1.6 if query_info.needs_metadata_filter else 1.0
                weights.append(boost)
                raw["bm25"] = bm25

        tf = time.perf_counter()
        # Filter out zero-score BM25 results before fusion — they produce
        # non-zero RRF scores (rank-based) despite carrying zero retrieval
        # signal, which drowns out the actual dense matches.
        filtered_lists: list[list[tuple[str, float]]] = []
        filtered_weights: list[float] = []
        for rl, w in zip(ranked_lists, weights):
            non_zero = [(cid, s) for cid, s in rl if s > 0.0]
            if non_zero:
                filtered_lists.append(non_zero)
                filtered_weights.append(w)
        if not filtered_lists:
            # all lists were zero-scored — fall back to unfiltered
            filtered_lists = ranked_lists
            filtered_weights = weights

        fused = rrf_fuse(filtered_lists, settings.rrf_k, filtered_weights)[: settings.fusion_top_k]
        timings["fusion"] = (time.perf_counter() - tf) * 1000

        # contextual expansion: for hierarchical/complex queries, pull one
        # neighbouring chunk from each winning chunk's document.
        if query_info.chunk_strategy == "hierarchical":
            expanded: list[tuple[str, float]] = []
            seen: set[str] = set()
            for cid, score in fused:
                if cid not in seen:
                    expanded.append((cid, score))
                    seen.add(cid)
                for n in view.metadata.neighbours(cid, radius=1):
                    if n.chunk_id not in seen:
                        expanded.append((n.chunk_id, score * 0.9))
                        seen.add(n.chunk_id)
            fused = expanded[: settings.fusion_top_k]

        chunks: list[RetrievedChunk] = []
        dense_map = dict(raw.get("dense", []) or [])
        bm25_map = dict(raw.get("bm25", []) or [])
        for rank, (cid, fscore) in enumerate(fused):
            chunk = view.metadata.get_chunk(cid)
            if chunk is None:
                continue
            chunks.append(
                RetrievedChunk(
                    chunk_id=cid,
                    document_id=chunk.document_id,
                    text=chunk.text,
                    chunk_strategy=chunk.chunk_strategy,
                    dense_score=float(dense_map.get(cid, 0.0)),
                    bm25_score=float(bm25_map.get(cid, 0.0)),
                    fusion_score=float(fscore),
                    rank=rank,
                    metadata=dict(chunk.metadata),
                )
            )

        # confidence in [0, 1] from the *actual* retrieval scores, so it can
        # discriminate weak vs strong matches (an RRF-rank ratio cannot).
        #   dense: cosine similarity (clamped at 0)
        #   bm25:  raw score normalised by a reference ceiling
        parts: list[float] = []
        if dense_top and chunks:
            parts.append(max(0.0, max(c.dense_score for c in chunks)))
        if bm25_top and chunks:
            parts.append(min(1.0, max(c.bm25_score for c in chunks) / settings.bm25_confidence_ceiling))
        confidence = max(parts) if parts else 0.0

        timings["total"] = (time.perf_counter() - t0) * 1000
        return RetrievalResult(
            query=query,
            chunks=chunks,
            confidence=confidence,
            view=f"{query_info.retrieval_mode}+{view_name}",
            timings=timings,
            raw=raw,
        )
