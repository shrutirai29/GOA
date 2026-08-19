"""BM25 lexical retrieval (rank_bm25) with persistence.

BM25 complements dense retrieval on exact names, rare words, numbers and
technical terms. The tokenised corpus and model parameters are persisted so
no rebuilding happens at startup.
"""

from __future__ import annotations

import pickle
from pathlib import Path

from backend.chunking.base import tokenize


class Bm25Index:
    def __init__(self) -> None:
        self.model = None
        self.tokenized: list[list[str]] = []

    # ------------------------------------------------------------------ build
    def build(self, texts: list[str]) -> None:
        from rank_bm25 import BM25Okapi  # lazy import

        self.tokenized = [tokenize(t) for t in texts]
        self.model = BM25Okapi(self.tokenized)

    # ------------------------------------------------------------------ search
    def search(self, query: str, k: int) -> list[tuple[int, float]]:
        if self.model is None:
            return []
        scores = self.model.get_scores(tokenize(query))
        top = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
        return [(i, float(scores[i])) for i in top]

    # --------------------------------------------------------------- persist
    def save(self, directory: Path) -> None:
        directory.mkdir(parents=True, exist_ok=True)
        with open(directory / "bm25.pkl", "wb") as f:
            pickle.dump({"model": self.model, "tokenized": self.tokenized}, f)

    @classmethod
    def load(cls, directory: Path) -> "Bm25Index":
        with open(directory / "bm25.pkl", "rb") as f:
            payload = pickle.load(f)
        idx = cls()
        idx.model = payload["model"]
        idx.tokenized = payload["tokenized"]
        return idx
