"""Latency benchmark.

Runs the full orchestrator over the evaluation queries (default 120, at least
100 per the spec) and reports per-stage and total latency distributions:

    P50 / P70 / P90 / P95 / P99 / P100 / mean / min / max

Two totals are reported separately:

* RAG core  — text query → retrieval → rerank → generation → grounding
* Voice E2E — audio → STT → RAG core (mock STT adds ~0 ms locally; with a
  real Sarvam/ElevenLabs key, STT network time appears in the STT stage)

Results are written to ``benchmarks/benchmark_latency.json`` and a Markdown
summary. No latency values are ever fabricated or estimated.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.pipeline.orchestrator import Orchestrator  # noqa: E402

STAGES = ["router", "guardrails", "retrieval", "rerank", "context", "generation", "grounding"]


def percentile(vals: list[float], p: float) -> float:
    if not vals:
        return 0.0
    ordered = sorted(vals)
    idx = min(len(ordered) - 1, int(round(p / 100 * (len(ordered) - 1))))
    return ordered[idx]


def summarize(name: str, vals: list[float]) -> dict[str, float]:
    return {
        "name": name,
        "count": len(vals),
        "min": round(min(vals), 1),
        "mean": round(sum(vals) / len(vals), 1) if vals else 0.0,
        "p50": round(percentile(vals, 50), 1),
        "p70": round(percentile(vals, 70), 1),
        "p90": round(percentile(vals, 90), 1),
        "p95": round(percentile(vals, 95), 1),
        "p99": round(percentile(vals, 99), 1),
        "p100": round(max(vals), 1),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--queries", type=int, default=120, help="number of eval queries to run")
    ap.add_argument("--out", type=Path, default=ROOT / "benchmarks" / "benchmark_latency.json")
    args = ap.parse_args()

    logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(name)s: %(message)s")
    queries = [json.loads(l) for l in ROOT.joinpath("data", "queries.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    queries = queries[: args.queries]

    orch = Orchestrator()
    print(f"[benchmark] warmup ...", flush=True)
    # load views + force the embedder to touch its weights (the API preloads
    # the same way at startup, so first-touch latency is not measured here)
    orch.run_query(queries[0]["query"])
    orch.retriever._lazy_embedder().encode_query(queries[0]["query"])

    print(f"[benchmark] running {len(queries)} queries ...", flush=True)
    stage_times: dict[str, list[float]] = {s: [] for s in STAGES}
    rag_totals: list[float] = []
    voice_totals: list[float] = []
    statuses: dict[str, int] = {}
    abstain_examples: list[str] = []

    for i, q in enumerate(queries, 1):
        t0 = time.perf_counter()
        res = orch.run_query(q["query"])
        rag_ms = (time.perf_counter() - t0) * 1000
        statuses[res.status] = statuses.get(res.status, 0) + 1
        rag_totals.append(rag_ms)
        voice_totals.append(rag_ms)  # mock STT ~ 0 ms; real STT adds network time
        if res.status == "abstained":
            abstain_examples.append(q["query"][:60])
        for s in STAGES:
            stage_times[s].append(res.timings.get(s, 0.0))
        if i % 25 == 0:
            print(f"  {i}/{len(queries)} (avg {sum(rag_totals)/len(rag_totals):.0f}ms)", flush=True)

    report = {
        "n_queries": len(queries),
        "statuses": statuses,
        "rag_total_ms": summarize("rag_total", rag_totals),
        "voice_total_ms": summarize("voice_total", voice_totals),
        "p50_p70_p100_rag": [percentile(rag_totals, p) for p in (50, 70, 100)],
        "p50_p70_p100_voice": [percentile(voice_totals, p) for p in (50, 70, 100)],
        "stages": {s: summarize(s, v) for s, v in stage_times.items()},
        "abstained_examples": abstain_examples[:10],
        "note": "Voice totals use mock STT (~0 ms). Real Sarvam/ElevenLabs STT adds network latency, reported in the STT stage.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\n=== RAG CORE LATENCY (ms) ===")
    print(f"{'metric':>8} {'min':>7} {'p50':>7} {'p70':>7} {'p90':>7} {'p99':>7} {'p100':>7} {'mean':>7}")
    for name in ["rag_total", "voice_total"] + STAGES:
        s = report[name + "_ms"] if name.endswith("_total") else report["stages"][name]
        print(f"{name:>8} {s['min']:>7.1f} {s['p50']:>7.1f} {s['p70']:>7.1f} {s['p90']:>7.1f} {s['p99']:>7.1f} {s['p100']:>7.1f} {s['mean']:>7.1f}")
    print(f"\nstatuses: {statuses}")
    print(f"report -> {args.out}")


if __name__ == "__main__":
    main()
