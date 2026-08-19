"""Reranking layer.

A cross-encoder scores each (query, chunk) pair directly, which is far more
accurate than dot-product retrieval similarity. The model is loaded lazily on
first use so startup stays fast; if the model cannot be loaded (no network,
disabled, missing dependency) the pipeline degrades gracefully to the fusion
score from retrieval — the orchestrator records which path was taken.
"""

from __future__ import annotations

from backend.config import settings
from backend.models import RetrievedChunk


class Reranker:
    def __init__(self) -> None:
        self._model = None
        self._load_error: str | None = None

    # ------------------------------------------------------------------ load
    def _ensure_model(self) -> bool:
        if self._model is not None:
            return True
        if not settings.reranker_enabled:
            return False
        try:
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(settings.reranker_model)
            return True
        except Exception as exc:  # pragma: no cover - network/dependency failure
            self._load_error = str(exc)
            return False

    @property
    def active(self) -> bool:
        return self._model is not None

    # ---------------------------------------------------------------- score
    def rerank(self, query: str, chunks: list[RetrievedChunk], top_k: int | None = None) -> list[RetrievedChunk]:
        """Score (query, chunk) pairs with the cross-encoder and re-sort.

        Returns a new list of the same :class:`RetrievedChunk` objects with a
        ``rerank_score`` populated, ordered best-first. Falls back to fusion
        order when the model is unavailable.
        """
        if not chunks:
            return []
        k = top_k or settings.rerank_top_k
        if not self._ensure_model():
            for c in chunks:
                c.metadata["rerank_method"] = "fusion-fallback"
                c.metadata["rerank_score"] = c.fusion_score
            return sorted(chunks, key=lambda c: c.fusion_score, reverse=True)[:k]

        pairs = [(query, c.text) for c in chunks]
        scores = self._model.predict(pairs)
        for c, s in zip(chunks, scores):
            c.metadata["rerank_method"] = "cross-encoder"
            c.metadata["rerank_score"] = float(s)
        ordered = sorted(chunks, key=lambda c: c.metadata["rerank_score"], reverse=True)
        return ordered[:k]
