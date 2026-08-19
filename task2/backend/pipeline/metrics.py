"""In-memory latency + status metrics.

A small ring buffer of recent requests, plus percentile helpers (P50/P70/P90/
P95/P99/P100) for the ``/api/metrics`` endpoint. Nothing here touches disk.
"""

from __future__ import annotations

import time
from collections import deque
from statistics import mean, median
from typing import Any


class MetricsRegistry:
    def __init__(self, maxlen: int = 1000) -> None:
        self.maxlen = maxlen
        self._records: deque[dict[str, Any]] = deque(maxlen=maxlen)
        self.started_at = time.time()

    # --------------------------------------------------------------- record
    def record(self, entry: dict[str, Any]) -> None:
        self._records.append(dict(entry))

    # ------------------------------------------------------------- queries
    def recent(self, limit: int = 100) -> list[dict[str, Any]]:
        return list(self._records)[-limit:]

    def percentile(self, values: list[float], p: float) -> float:
        if not values:
            return 0.0
        ordered = sorted(values)
        idx = min(len(ordered) - 1, int(round(p / 100 * (len(ordered) - 1))))
        return ordered[idx]

    # ------------------------------------------------------------- summary
    def summary(self, limit: int = 500) -> dict[str, Any]:
        recs = list(self._records)[-limit:]
        total_ms = [r.get("total_ms", 0.0) for r in recs]
        rag_ms = [r.get("rag_ms", r.get("total_ms", 0.0)) for r in recs]
        statuses: dict[str, int] = {}
        for r in recs:
            statuses[r.get("status", "?")] = statuses.get(r.get("status", "?"), 0) + 1

        def summarize(vals: list[float]) -> dict[str, float]:
            if not vals:
                return {"count": 0}
            return {
                "count": len(vals),
                "mean": round(mean(vals), 1),
                "min": round(min(vals), 1),
                "p50": round(self.percentile(vals, 50), 1),
                "p70": round(self.percentile(vals, 70), 1),
                "p90": round(self.percentile(vals, 90), 1),
                "p95": round(self.percentile(vals, 95), 1),
                "p99": round(self.percentile(vals, 99), 1),
                "p100": round(max(vals), 1),
            }

        return {
            "uptime_s": round(time.time() - self.started_at, 1),
            "requests": len(recs),
            "statuses": statuses,
            "total_ms": summarize(total_ms),
            "rag_ms": summarize(rag_ms),
            "p50_p70_p100_total": [round(self.percentile(total_ms, p), 1) for p in (50, 70, 100)],
        }


registry = MetricsRegistry()
