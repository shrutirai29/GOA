"""Strategy A — sentence-based chunking with overlapping sentence windows.

    Sentence 1  Sentence 2  Sentence 3  Sentence 4  Sentence 5
    chunk 1 = 1,2,3 | chunk 2 = 2,3,4 | chunk 3 = 3,4,5
"""

from __future__ import annotations

from backend.chunking.base import Chunk, sentence_split
from backend.config import settings


class SentenceChunker:
    strategy = "sentence"

    def __init__(self, window: int | None = None, overlap: int | None = None) -> None:
        self.window = window or settings.sentence_window
        self.overlap = overlap if overlap is not None else settings.sentence_overlap
        if self.overlap >= self.window:
            raise ValueError("overlap must be smaller than window")

    def chunk(self, document_id: str, text: str, language: str = "hi") -> list[Chunk]:
        sentences = sentence_split(text)
        if not sentences:
            return []
        if len(sentences) <= self.window:
            return [
                Chunk(
                    chunk_id=f"{document_id}_sent_00",
                    document_id=document_id,
                    chunk_strategy=self.strategy,
                    chunk_index=0,
                    text=text.strip(),
                    language=language,
                    sentence_indices=list(range(len(sentences))),
                )
            ]

        chunks: list[Chunk] = []
        step = self.window - self.overlap
        start = 0
        index = 0
        while start < len(sentences):
            window_sentences = sentences[start : start + self.window]
            chunk = Chunk(
                chunk_id=f"{document_id}_sent_{index:02d}",
                document_id=document_id,
                chunk_strategy=self.strategy,
                chunk_index=index,
                text=" ".join(window_sentences),
                language=language,
                sentence_indices=list(range(start, start + len(window_sentences))),
            )
            chunk.metadata["sentence_window"] = (start, start + len(window_sentences))
            chunks.append(chunk)
            index += 1
            if start + self.window >= len(sentences):
                break
            start += step

        for i in range(len(chunks)):
            if i > 0:
                chunks[i].prev_chunk_id = chunks[i - 1].chunk_id
            if i < len(chunks) - 1:
                chunks[i].next_chunk_id = chunks[i + 1].chunk_id
        return chunks
