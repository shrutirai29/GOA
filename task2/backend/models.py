"""Structured objects exchanged between pipeline stages.

Keeping every stage's input/output as a typed dataclass makes the
orchestration explicit, testable and auditable.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


# --------------------------------------------------------------- query types
FACTUAL = "FACTUAL"
ENTITY = "ENTITY"
PERSON = "PERSON"
LOCATION = "LOCATION"
NUMERIC = "NUMERIC"
COMPARISON = "COMPARISON"
CONCEPTUAL = "CONCEPTUAL"
COMPLEX = "COMPLEX"
UNSUPPORTED = "UNSUPPORTED"

QUERY_TYPES = (FACTUAL, ENTITY, PERSON, LOCATION, NUMERIC, COMPARISON, CONCEPTUAL, COMPLEX, UNSUPPORTED)


@dataclass
class QueryInfo:
    """Output of query understanding + routing."""

    query: str
    query_type: str = FACTUAL
    language: str = "hi"
    chunk_strategy: str = "semantic"  # index view to query
    retrieval_mode: str = "hybrid"  # dense | bm25 | hybrid
    needs_metadata_filter: bool = False
    raw_scores: dict[str, float] = field(default_factory=dict)


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    text: str
    chunk_strategy: str
    dense_score: float = 0.0
    bm25_score: float = 0.0
    fusion_score: float = 0.0
    rank: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalResult:
    query: str
    chunks: list[RetrievedChunk]
    confidence: float = 0.0  # max fusion score, normalised
    view: str = "hybrid"
    timings: dict[str, float] = field(default_factory=dict)
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class RerankedChunk:
    chunk: RetrievedChunk
    rerank_score: float = 0.0


@dataclass
class ContextChunk:
    document_id: str
    chunk_id: str
    text: str
    relevance: float = 0.0
    source_index: int = 0


@dataclass
class Context:
    chunks: list[ContextChunk]
    total_tokens: int = 0
    deduped: int = 0
    merged: int = 0
    truncated: int = 0


@dataclass
class SourceRef:
    document_id: str
    chunk_id: str
    relevance: float = 0.0


@dataclass
class Answer:
    text: str
    grounded: bool = False
    confidence: float = 0.0
    sources: list[SourceRef] = field(default_factory=list)
    provider: str = ""


@dataclass
class GroundingResult:
    is_grounded: bool = False
    score: float = 0.0
    claim_scores: list[float] = field(default_factory=list)
    method: str = "lexical+semantic"
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class GuardrailResult:
    allowed: bool = True
    category: str = "ok"
    reason: str = ""
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class StageTiming:
    name: str
    duration_ms: float


@dataclass
class PipelineResult:
    request_id: str
    status: str = "ok"  # ok | abstained | blocked | error
    transcript: str = ""
    query: str = ""
    query_info: QueryInfo | None = None
    guardrail: GuardrailResult | None = None
    retrieval: RetrievalResult | None = None
    reranked: list[RerankedChunk] | None = None
    context: Context | None = None
    answer: Answer | None = None
    grounding: GroundingResult | None = None
    timings: dict[str, float] = field(default_factory=dict)
    total_ms: float = 0.0
    voice_total_ms: float = 0.0
    error: str = ""
    messages: list[str] = field(default_factory=list)
