"""Retrieval evaluation.

Runs each retrieval strategy (fixed / sentence / semantic / hierarchical
views, hybrid fusion, and hybrid + cross-encoder reranking) against the eval
queries with gold relevance labels (``is_selected`` passages from the
dataset) and reports:

    Recall@1 / Recall@5 / Recall@10 / MRR / Precision@K

All numbers come from actual experiments — nothing is fabricated. The table
is written to ``benchmarks/retrieval_eval.json`` and printed to stdout.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.config import settings  # noqa: E402
from backend.models import QueryInfo  # noqa: E402
from backend.pipeline.reranker import Reranker  # noqa: E402
from backend.pipeline.retriever import Retriever, rrf_fuse  # noqa: E402

STRATEGIES = ["fixed", "sentence", "semantic", "hierarchical"]
# per-view hybrid strategies + two meta-strategies:
#   hybrid_fusion  — RRF fusion across all four views' hybrid results
#   hybrid_rerank  — cross-view fusion then cross-encoder reranking
MODES = {
    "fixed": ("fixed", "hybrid", False),
    "sentence": ("sentence", "hybrid", False),
    "semantic": ("semantic", "hybrid", False),
    "hierarchical": ("hierarchical", "hybrid", False),
    "hybrid_fusion": (None, "hybrid", False),
    "hybrid_rerank": (None, "hybrid", True),
}


def recall_at(ranked: list[str], gold: set[str], k: int) -> int:
    return int(any(doc in gold for doc in ranked[:k]))


def mrr(ranked: list[str], gold: set[str]) -> float:
    for i, doc in enumerate(ranked):
        if doc in gold:
            return 1.0 / (i + 1)
    return 0.0


def precision_at(ranked: list[str], gold: set[str], k: int) -> float:
    if not ranked:
        return 0.0
    hits = sum(1 for doc in ranked[:k] if doc in gold)
    return hits / k


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--queries", type=int, default=100)
    ap.add_argument("--out", type=Path, default=ROOT / "benchmarks" / "retrieval_eval.json")
    args = ap.parse_args()

    queries = [
        json.loads(l)
        for l in ROOT.joinpath("data", "queries.jsonl").read_text(encoding="utf-8").splitlines()
        if l.strip()
    ][: args.queries]

    retriever = Retriever(view_names=STRATEGIES)
    reranker = Reranker()

    def ranked_docs(view: str | None, mode: str, query: str, use_rerank: bool) -> list[str]:
        if view is not None:
            qi = QueryInfo(query=query, query_type="FACTUAL", chunk_strategy=view, retrieval_mode=mode)
            res = retriever.retrieve(query, qi)
            chunks = res.chunks
        else:
            # cross-view fusion: retrieve from every view, fuse at chunk level
            per_view: list[list[tuple[str, float]]] = []
            for v in STRATEGIES:
                qi = QueryInfo(query=query, query_type="FACTUAL", chunk_strategy=v, retrieval_mode=mode)
                res = retriever.retrieve(query, qi)
                per_view.append([(c.chunk_id, c.fusion_score) for c in res.chunks[:20]])
            by_id: dict[str, dict] = {}
            for v, lst in zip(STRATEGIES, per_view):
                for cid, _s in lst:
                    c = retriever.views[v].metadata.get_chunk(cid)
                    if c is not None:
                        by_id[cid] = {"doc": c.document_id, "chunk": c}
            fused = rrf_fuse(per_view, settings.rrf_k)
            chunks = [by_id[cid]["chunk"] for cid, _ in fused[:10] if cid in by_id]
            from backend.models import RetrievedChunk

            chunks = [
                RetrievedChunk(
                    chunk_id=c.chunk_id,
                    document_id=c.document_id,
                    text=c.text,
                    chunk_strategy=c.chunk_strategy,
                    fusion_score=0.0,
                )
                for c in chunks
            ]
        if use_rerank:
            chunks = reranker.rerank(query, chunks, top_k=10)
        return [c.document_id for c in chunks[:10]]

    print(f"[eval] warmup ...", flush=True)
    ranked_docs("sentence", "hybrid", queries[0]["query"], False)

    results: dict[str, dict] = {}
    for name, (view, mode, use_rerank) in MODES.items():
        metrics = {"r@1": 0, "r@5": 0, "r@10": 0, "mrr": 0.0, "p@5": 0.0}
        n = 0
        for q in queries:
            gold = set(q["gold_passage_ids"])
            if not gold:
                continue
            ranked = ranked_docs(view, mode, q["query"], use_rerank)
            metrics["r@1"] += recall_at(ranked, gold, 1)
            metrics["r@5"] += recall_at(ranked, gold, 5)
            metrics["r@10"] += recall_at(ranked, gold, 10)
            metrics["mrr"] += mrr(ranked, gold)
            metrics["p@5"] += precision_at(ranked, gold, 5)
            n += 1
        if n:
            results[name] = {
                "n": n,
                "recall@1": round(metrics["r@1"] / n, 3),
                "recall@5": round(metrics["r@5"] / n, 3),
                "recall@10": round(metrics["r@10"] / n, 3),
                "mrr": round(metrics["mrr"] / n, 3),
                "precision@5": round(metrics["p@5"] / n, 3),
            }

    print(f"\n{'strategy':<16} {'R@1':>6} {'R@5':>6} {'R@10':>6} {'MRR':>6} {'P@5':>6}")
    for name, r in results.items():
        print(f"{name:<16} {r['recall@1']:>6.3f} {r['recall@5']:>6.3f} {r['recall@10']:>6.3f} {r['mrr']:>6.3f} {r['precision@5']:>6.3f}")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps({"queries": args.queries, "results": results}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nreport -> {args.out}")


if __name__ == "__main__":
    main()
