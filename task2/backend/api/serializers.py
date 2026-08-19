"""JSON-safe serialization of pipeline result objects."""

from __future__ import annotations

from typing import Any

from backend.models import (
    Answer,
    Context,
    GroundingResult,
    GuardrailResult,
    PipelineResult,
    QueryInfo,
    RetrievalResult,
)


def _answer(a: Answer | None) -> dict[str, Any] | None:
    if a is None:
        return None
    return {
        "text": a.text,
        "grounded": a.grounded,
        "confidence": a.confidence,
        "sources": [
            {"document_id": s.document_id, "chunk_id": s.chunk_id, "relevance": s.relevance}
            for s in a.sources
        ],
        "provider": a.provider,
    }


def _grounding(g: GroundingResult | None) -> dict[str, Any] | None:
    if g is None:
        return None
    return {
        "is_grounded": g.is_grounded,
        "score": g.score,
        "method": g.method,
        "claim_scores": g.claim_scores,
    }


def _guardrail(g: GuardrailResult | None) -> dict[str, Any] | None:
    if g is None:
        return None
    return {"allowed": g.allowed, "category": g.category, "reason": g.reason}


def _query_info(qi: QueryInfo | None) -> dict[str, Any] | None:
    if qi is None:
        return None
    return {
        "query_type": qi.query_type,
        "chunk_strategy": qi.chunk_strategy,
        "retrieval_mode": qi.retrieval_mode,
        "needs_metadata_filter": qi.needs_metadata_filter,
    }


def _retrieval(r: RetrievalResult | None) -> dict[str, Any] | None:
    if r is None:
        return None
    return {
        "view": r.view,
        "confidence": r.confidence,
        "num_chunks": len(r.chunks),
        "chunks": [
            {
                "chunk_id": c.chunk_id,
                "document_id": c.document_id,
                "rank": c.rank,
                "fusion_score": c.fusion_score,
                "dense_score": c.dense_score,
                "bm25_score": c.bm25_score,
            }
            for c in r.chunks
        ],
    }


def _context(c: Context | None) -> dict[str, Any] | None:
    if c is None:
        return None
    return {
        "total_tokens": c.total_tokens,
        "deduped": c.deduped,
        "merged": c.merged,
        "truncated": c.truncated,
        "num_chunks": len(c.chunks),
    }


def pipeline_result_to_dict(r: PipelineResult) -> dict[str, Any]:
    return {
        "request_id": r.request_id,
        "status": r.status,
        "transcript": r.transcript,
        "query": r.query,
        "query_info": _query_info(r.query_info),
        "guardrail": _guardrail(r.guardrail),
        "retrieval": _retrieval(r.retrieval),
        "reranked": r.reranked,
        "context": _context(r.context),
        "answer": _answer(r.answer),
        "grounding": _grounding(r.grounding),
        "timings": r.timings,
        "total_ms": r.total_ms,
        "voice_total_ms": r.voice_total_ms,
        "status_message": "; ".join(r.messages) if r.messages else "",
        "error": r.error,
    }
