"""Build the knowledge base and all retrieval views (offline).

Step 1 — corpus: read a local MSMARCO-XI parquet shard (see
``scripts/download_dataset.py``), dedupe passages for ``--lang``, cap the
corpus and extract evaluation queries with gold relevance labels.

Step 2 — indexing: chunk every document with each strategy (fixed, sentence,
semantic, hierarchical) and build FAISS + BM25 + metadata indexes per view.

Usage:
    PYTHONIOENCODING=utf-8 python scripts/build_index.py --shard data/dataset/validation/0003.parquet
    PYTHONIOENCODING=utf-8 python scripts/build_index.py  # reuse existing data/corpus.jsonl
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.config import settings  # noqa: E402
from backend.indexing.builder import IndexBuilder  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--shard", type=Path, default=None, help="local parquet shard for corpus extraction")
    ap.add_argument("--lang", default=settings.lang)
    ap.add_argument("--max-passages", type=int, default=settings.max_passages)
    ap.add_argument("--max-queries", type=int, default=settings.max_queries)
    ap.add_argument("--views", nargs="*", default=None, help="default: all four")
    ap.add_argument("--skip-corpus", action="store_true", help="reuse existing corpus.jsonl")
    args = ap.parse_args()

    builder = IndexBuilder()
    t0 = time.time()

    if not args.skip_corpus:
        if args.shard is None:
            raise SystemExit("--shard required the first time (or pass --skip-corpus)")
        print(f"[corpus] building from {args.shard} (lang={args.lang}, max={args.max_passages})", flush=True)
        documents, queries = IndexBuilder.build_corpus_from_shard(
            args.shard, lang=args.lang, max_passages=args.max_passages, max_queries=args.max_queries
        )
        IndexBuilder.save_corpus(documents, queries)
    else:
        documents, queries = IndexBuilder.load_corpus()
        print(f"[corpus] loaded {len(documents)} docs / {len(queries)} queries")

    print(f"[index] building views: {args.views or ['fixed', 'sentence', 'semantic', 'hierarchical']}", flush=True)
    builder.build(args.views)

    print(f"[done] total {time.time() - t0:.1f}s")


if __name__ == "__main__":
    main()
