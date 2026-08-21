"""Shared chunking primitives: the :class:`Chunk` type, sentence splitting
(Devanagari + Latin aware) and tokenisation helpers.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

# Sentence boundaries: Devanagari danda "।", full stop, question/exclamation
# marks, and end-of-line breaks. Abbreviations (e.g. "Dr.", "Mr.", "U.S.")
# are left as-is; the splitter is intentionally lightweight and robust.
_SENTENCE_RE = re.compile(
    r"[^।.!?\n]+[।.!?]+[\"'\u201d\u2019)]*|\n+|[^।.!?\n]+$",
    re.UNICODE,
)

# Word tokenisation: sequences of letters/digits across all Indian scripts + Latin.
# Covers: Devanagari (0900-097F), Bengali/Assamese (0980-09FF),
# Gurmukhi (0A00-0A7F), Gujarati (0A80-0AFF), Oriya (0B00-0B7F),
# Tamil (0B80-0BFF), Telugu (0C00-0C7F), Kannada (0C80-0CFF),
# Malayalam (0D00-0D7F), Sinhala (0D80-0DFF), Thai (0E00-0E7F),
# Tibetan (0F00-0FFF), Myanmar (1000-109F), Khmer (1780-17FF),
# Lao (0E80-0EFF), and general \w (Latin, digits, underscore).
_TOKEN_RE = re.compile(
    r"[\w\u0900-\u09FF\u0A00-\u0AFF\u0B00-\u0BFF\u0C00-\u0CFF"
    r"\u0D00-\u0DFF\u0E00-\u0EFF\u0F00-\u0FFF\u1000-\u109F"
    r"\u1780-\u17FF\u19E0-\u19FF]+",
    re.UNICODE,
)


def sentence_split(text: str) -> list[str]:
    """Split text into sentences, keeping punctuation attached."""
    sentences = []
    for m in _SENTENCE_RE.finditer(text):
        s = m.group(0).strip()
        if s and not re.fullmatch(r"[\n\s]+", s):
            sentences.append(s)
    return sentences


def tokenize(text: str) -> list[str]:
    """Lightweight word-level tokenisation (works for Devanagari + Latin)."""
    return [t.lower() for t in _TOKEN_RE.findall(text.lower())]


def count_tokens(text: str) -> int:
    return len(tokenize(text))


@dataclass
class Chunk:
    """A single retrievable unit with full provenance metadata."""

    chunk_id: str
    document_id: str
    chunk_strategy: str
    chunk_index: int
    text: str
    language: str = "hi"
    token_count: int = 0
    parent_document: str = ""
    section: str = ""
    paragraph_index: int = -1
    sentence_indices: list[int] = field(default_factory=list)
    prev_chunk_id: str = ""
    next_chunk_id: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.parent_document:
            self.parent_document = self.document_id
        if not self.token_count:
            self.token_count = count_tokens(self.text)

    @property
    def id(self) -> str:  # convenience alias
        return self.chunk_id

    def to_dict(self) -> dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "chunk_strategy": self.chunk_strategy,
            "chunk_index": self.chunk_index,
            "text": self.text,
            "parent_document": self.parent_document,
            "language": self.language,
            "token_count": self.token_count,
            "section": self.section,
            "paragraph_index": self.paragraph_index,
            "sentence_indices": self.sentence_indices,
            "prev_chunk_id": self.prev_chunk_id,
            "next_chunk_id": self.next_chunk_id,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "Chunk":
        return cls(**d)


def join_chunks(a: Chunk, b: Chunk) -> Chunk:
    """Merge two adjacent chunks into one (used by the context builder)."""
    merged = Chunk(
        chunk_id=f"{a.chunk_id}~{b.chunk_id}",
        document_id=a.document_id,
        chunk_strategy=a.chunk_strategy,
        chunk_index=a.chunk_index,
        text=(a.text + "\n" + b.text).strip(),
        language=a.language,
        parent_document=a.parent_document,
        section=a.section,
        paragraph_index=a.paragraph_index,
        sentence_indices=a.sentence_indices + b.sentence_indices,
        metadata={**a.metadata, **b.metadata},
    )
    return merged
