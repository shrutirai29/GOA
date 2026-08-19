"""Context construction for generation.

Responsibilities (per spec): remove duplicate chunks, merge adjacent chunks of
the same document, keep the context within a configurable token budget,
prioritise high-scoring evidence and preserve document/source information so
the generator can cite its sources.
"""

from __future__ import annotations

from backend.chunking.base import count_tokens
from backend.config import settings
from backend.models import Context, ContextChunk, RetrievedChunk


class ContextBuilder:
    def __init__(self, max_tokens: int | None = None) -> None:
        self.max_tokens = max_tokens or settings.max_context_tokens

    def build(self, chunks: list[RetrievedChunk]) -> Context:
        stats = {"deduped": 0, "merged": 0, "truncated": 0}

        # 1. dedupe by chunk id (keep highest relevance)
        seen: dict[str, RetrievedChunk] = {}
        for c in chunks:
            prev = seen.get(c.chunk_id)
            if prev is None or c.fusion_score > prev.fusion_score:
                if prev is not None:
                    stats["deduped"] += 1
                seen[c.chunk_id] = c
        ordered = sorted(seen.values(), key=lambda c: c.fusion_score, reverse=True)

        # 2. merge adjacent chunks from the same document (consecutive
        #    chunk_index) into one context entry — keeps evidence contiguous.
        merged: list[RetrievedChunk] = []
        for c in ordered:
            if merged and merged[-1].document_id == c.document_id:
                prev_idx = merged[-1].metadata.get("chunk_index", -1)
                cur_idx = c.metadata.get("chunk_index", -1)
                if cur_idx == prev_idx + 1:
                    merged[-1].metadata["chunk_index"] = cur_idx
                    merged[-1].text = merged[-1].text + " " + c.text
                    merged[-1].metadata["merged_with"] = merged[-1].metadata.get("merged_with", []) + [
                        c.chunk_id
                    ]
                    stats["merged"] += 1
                    continue
            merged.append(c)

        # 3. budget: fill with highest-scoring evidence until the token cap
        out: list[ContextChunk] = []
        used = 0
        for i, c in enumerate(merged):
            tokens = count_tokens(c.text)
            if used + tokens > self.max_tokens and out:
                stats["truncated"] += 1
                continue
            used += tokens
            relevance = max(c.fusion_score, c.dense_score, c.bm25_score / settings.bm25_confidence_ceiling)
            out.append(
                ContextChunk(
                    document_id=c.document_id,
                    chunk_id=c.chunk_id,
                    text=c.text,
                    relevance=round(float(relevance), 4),
                    source_index=i,
                )
            )
            if used >= self.max_tokens:
                break

        return Context(chunks=out, total_tokens=used, **stats)
