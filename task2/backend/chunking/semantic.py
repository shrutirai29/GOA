"""Strategy C — semantic chunking.

Sentences are embedded and grouped by *semantic similarity*: when the cosine
similarity between neighbouring sentences drops below a configurable
threshold, a topic boundary is assumed and a new chunk starts. The chunk size
is additionally clamped to ``[min, max]`` sentences so a single long-winded
topic cannot produce an unbounded chunk.

Embeddings are computed lazily: if an embedder is not provided, the caller
(offline index build) passes one; at runtime we only *read* pre-built chunks.
"""

from __future__ import annotations

from typing import Protocol

import numpy as np

from backend.chunking.base import Chunk, sentence_split
from backend.config import settings


class Embedder(Protocol):
    def embed(self, texts: list[str]) -> np.ndarray:  # (n, d) float32
        ...


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1e-9
    return float(np.dot(a, b) / denom)


class SemanticChunker:
    strategy = "semantic"

    def __init__(
        self,
        embedder: Embedder | None = None,
        threshold: float | None = None,
        min_sentences: int | None = None,
        max_sentences: int | None = None,
    ) -> None:
        self.embedder = embedder
        self.threshold = threshold if threshold is not None else settings.semantic_threshold
        self.min_sentences = min_sentences or settings.semantic_min_chunk_sentences
        self.max_sentences = max_sentences or settings.semantic_max_chunk_sentences

    def chunk(
        self,
        document_id: str,
        text: str,
        language: str = "hi",
        sentence_vectors: np.ndarray | None = None,
    ) -> list[Chunk]:
        sentences = sentence_split(text)
        if not sentences:
            return []
        if len(sentences) == 1 or (self.embedder is None and sentence_vectors is None):
            return [
                Chunk(
                    chunk_id=f"{document_id}_sem_00",
                    document_id=document_id,
                    chunk_strategy=self.strategy,
                    chunk_index=0,
                    text=text.strip(),
                    language=language,
                    sentence_indices=list(range(len(sentences))),
                )
            ]

        # embed sentences (precomputed vectors win; fall back to the embedder)
        if sentence_vectors is not None:
            vecs = np.asarray(sentence_vectors, dtype=np.float32)
        else:
            vecs = np.asarray(self.embedder.embed(sentences), dtype=np.float32)
        sims = [cosine(vecs[i], vecs[i + 1]) for i in range(len(vecs) - 1)]

        # boundary where similarity < threshold
        boundaries = [0]
        current_start = 0
        for i, s in enumerate(sims):
            if s < self.threshold and (i + 1 - current_start) >= self.min_sentences:
                boundaries.append(i + 1)
                current_start = i + 1
        boundaries.append(len(sentences))

        # clamp chunk sizes to max_sentences
        groups: list[list[int]] = []
        for start, end in zip(boundaries[:-1], boundaries[1:]):
            span = list(range(start, end))
            for k in range(0, len(span), self.max_sentences):
                groups.append(span[k : k + self.max_sentences])

        chunks: list[Chunk] = []
        for index, span in enumerate(groups):
            chunk = Chunk(
                chunk_id=f"{document_id}_sem_{index:02d}",
                document_id=document_id,
                chunk_strategy=self.strategy,
                chunk_index=index,
                text=" ".join(sentences[i] for i in span),
                language=language,
                sentence_indices=span,
            )
            if index > 0:
                chunk.metadata["boundary_score"] = float(sims[max(0, span[0] - 1)])
            chunk.metadata["semantic_similarities"] = [round(s, 4) for s in sims]
            chunks.append(chunk)

        for i in range(len(chunks)):
            if i > 0:
                chunks[i].prev_chunk_id = chunks[i - 1].chunk_id
            if i < len(chunks) - 1:
                chunks[i].next_chunk_id = chunks[i + 1].chunk_id
        return chunks
