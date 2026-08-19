"""Strategy B — fixed-size token chunking with configurable overlap."""

from __future__ import annotations

from backend.chunking.base import Chunk, count_tokens, tokenize
from backend.config import settings


class FixedTokenChunker:
    """Split text into fixed-size windows of *tokens* with overlap.

    The window is measured in word tokens (Devanagari- and Latin-aware),
    not characters. Both ``chunk_size`` and ``overlap`` are configurable.
    """

    strategy = "fixed"

    def __init__(self, chunk_size: int | None = None, overlap: int | None = None) -> None:
        self.chunk_size = chunk_size or settings.fixed_chunk_size
        self.overlap = overlap if overlap is not None else settings.fixed_overlap
        if self.overlap >= self.chunk_size:
            raise ValueError("overlap must be smaller than chunk_size")

    def chunk(self, document_id: str, text: str, language: str = "hi") -> list[Chunk]:
        tokens = tokenize(text)
        if not tokens:
            return []
        if len(tokens) <= self.chunk_size:
            return [
                Chunk(
                    chunk_id=f"{document_id}_fixed_00",
                    document_id=document_id,
                    chunk_strategy=self.strategy,
                    chunk_index=0,
                    text=text.strip(),
                    language=language,
                )
            ]

        chunks: list[Chunk] = []
        step = self.chunk_size - self.overlap
        start = 0
        index = 0
        # Recover the original character span for each token by scanning.
        while start < len(tokens):
            end = min(start + self.chunk_size, len(tokens))
            window_tokens = tokens[start:end]
            text_fragment = _tokens_to_text(window_tokens, text)
            chunk = Chunk(
                chunk_id=f"{document_id}_fixed_{index:02d}",
                document_id=document_id,
                chunk_strategy=self.strategy,
                chunk_index=index,
                text=text_fragment,
                language=language,
            )
            chunk.metadata["token_window"] = (start, end)
            chunks.append(chunk)
            index += 1
            if end >= len(tokens):
                break
            start += step

        # link neighbours
        for i in range(len(chunks)):
            if i > 0:
                chunks[i].prev_chunk_id = chunks[i - 1].chunk_id
            if i < len(chunks) - 1:
                chunks[i].next_chunk_id = chunks[i + 1].chunk_id
        return chunks


def _tokens_to_text(tokens: list[str], original: str) -> str:
    """Best-effort reconstruction of the token window from the original text
    (tokens are lower-cased by :func:`tokenize`, so we match case-insensitively)."""
    low = original.lower()
    idx = 0
    parts: list[str] = []
    for tok in tokens:
        pos = low.find(tok, idx)
        if pos == -1:
            parts.append(tok)
            idx = len(low)
        else:
            parts.append(original[pos : pos + len(tok)])
            idx = pos + len(tok)
    return " ".join(parts)
