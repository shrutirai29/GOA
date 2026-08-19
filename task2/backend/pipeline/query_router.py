"""Lightweight query router / classifier.

A keyword + pattern based classifier (no LLM round-trip, so it costs ~microseconds)
that assigns each query a type and selects the retrieval strategy. The mapping
follows the spec:

    FACTUAL     → BM25 + sentence chunks
    ENTITY      → BM25 (+ metadata/exact-term boost)
    PERSON      → BM25 + sentence
    LOCATION    → BM25 + sentence
    NUMERIC     → BM25 + fixed chunks
    COMPARISON  → hybrid + hierarchical context
    CONCEPTUAL  → dense + semantic chunks
    COMPLEX     → hybrid + hierarchical context
    UNSUPPORTED → blocked by guardrails

Patterns live in ``backend.pipeline.patterns`` (Devanagari-safe boundaries,
case-insensitive). Detection order is most-specific first: person/location →
comparison → complex (long, multi-clause) → numeric → conceptual → factual.
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
    QUERY_TYPES,
    UNSUPPORTED,
    QueryInfo,
)
from backend.pipeline.patterns import (
    ATTACK,
    CMP,
    COMPLEX_HINT,
    CONCEPT,
    EXPLAIN,
    NUM,
    NUMERIC_TOKEN,
    OFFTOPIC,
    SAFETY,
    WHEN,
    WHERE,
    WHO,
)


class QueryRouter:
    """Classifies queries and picks the retrieval strategy."""

    def classify(self, query: str) -> QueryInfo:
        q = query.strip()
        if not q:
            return QueryInfo(query=query, query_type=UNSUPPORTED)

        # 1. safety + injection take absolute priority
        if ATTACK.search(q) or SAFETY.search(q):
            return QueryInfo(query=query, query_type=UNSUPPORTED)

        # 2. pure chit-chat / greetings → off-topic
        if OFFTOPIC.search(q) and len(q.split()) <= 4:
            return QueryInfo(query=query, query_type=UNSUPPORTED)

        # 3. type detection (most specific first)
        if WHO.search(q):
            return self._route(query, PERSON)
        if WHERE.search(q):
            return self._route(query, LOCATION)
        if CMP.search(q):
            return self._route(query, COMPARISON)
        if COMPLEX_HINT.search(q) and len(q.split()) > 14:
            return self._route(query, COMPLEX)
        if WHEN.search(q) or NUM.search(q) or NUMERIC_TOKEN.search(q):
            return self._route(query, NUMERIC)
        if CONCEPT.search(q) and EXPLAIN.search(q):
            return self._route(query, CONCEPTUAL)
        if EXPLAIN.search(q):
            return self._route(query, CONCEPTUAL)
        if CONCEPT.search(q):
            return self._route(query, FACTUAL)

        # 4. bare noun-phrase knowledge queries (e.g. "स्टबहब टोल फ्री नंबर")
        #    usually carry an entity → treat as entity/factual.
        if len(q.split()) >= 2:
            return self._route(query, ENTITY)

        return QueryInfo(query=query, query_type=UNSUPPORTED)

    # ---------------------------------------------------------------- routing
    @staticmethod
    def _route(query: str, query_type: str) -> QueryInfo:
        assert query_type in QUERY_TYPES
        table = {
            FACTUAL: ("sentence", "bm25", False),
            PERSON: ("sentence", "hybrid", True),
            LOCATION: ("sentence", "hybrid", True),
            NUMERIC: ("fixed", "bm25", False),
            COMPARISON: ("hierarchical", "hybrid", False),
            CONCEPTUAL: ("semantic", "dense", False),
            COMPLEX: ("hierarchical", "hybrid", False),
            ENTITY: ("sentence", "hybrid", True),
            UNSUPPORTED: ("sentence", "hybrid", False),
        }
        strategy, mode, meta_filter = table[query_type]
        return QueryInfo(
            query=query,
            query_type=query_type,
            chunk_strategy=strategy,
            retrieval_mode=mode,
            needs_metadata_filter=meta_filter,
        )
