"""Route query types to chunking strategies / retrieval views.

The mapping is data-driven (configurable) and deliberately simple — routing
must stay far below the latency budget.
"""

from __future__ import annotations

from backend.models import (
    COMPARISON,
    COMPLEX,
    CONCEPTUAL,
    ENTITY,
    FACTUAL,
    LOCATION,
    NUMERIC,
    PERSON,
    UNSUPPORTED,
)

# query_type -> (chunk_strategy view, retrieval_mode)
DEFAULT_ROUTING: dict[str, tuple[str, str]] = {
    FACTUAL: ("fixed", "hybrid"),
    ENTITY: ("sentence", "bm25"),  # exact names → lexical strength
    PERSON: ("sentence", "bm25"),
    LOCATION: ("sentence", "bm25"),
    NUMERIC: ("sentence", "hybrid"),  # numbers → lexical + dense
    COMPARISON: ("semantic", "hybrid"),
    CONCEPTUAL: ("semantic", "dense"),
    COMPLEX: ("hierarchical", "hybrid"),
    UNSUPPORTED: ("semantic", "hybrid"),
}


class ChunkingRouter:
    """Selects the index view + retrieval mode for a query type."""

    def __init__(self, routing: dict[str, tuple[str, str]] | None = None) -> None:
        self.routing = routing or DEFAULT_ROUTING

    def route(self, query_type: str) -> tuple[str, str]:
        return self.routing.get(query_type, ("semantic", "hybrid"))

    def available_views(self) -> list[str]:
        return sorted({v[0] for v in self.routing.values()})
