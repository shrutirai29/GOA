"""Strategy D — hierarchical chunking.

Structure kept per document::

    document  (passage_id)
      └── section   (paragraph group, e.g. blank-line separated)
            └── paragraph
                  └── sentences / sentence-window chunks

Every leaf chunk carries pointers back to its parent (document, section,
paragraph) and to its neighbouring chunks, so retrieval can expand to
surrounding context.
"""

from __future__ import annotations

from backend.chunking.base import Chunk, sentence_split
from backend.chunking.sentence import SentenceChunker
from backend.config import settings


class HierarchicalChunker:
    strategy = "hierarchical"

    def __init__(self, window: int | None = None) -> None:
        self.window = window or settings.sentence_window
        self._leaf = SentenceChunker(window=self.window, overlap=0)

    def chunk(self, document_id: str, text: str, language: str = "hi") -> list[Chunk]:
        # section split on blank lines / double newlines
        raw_sections = [s.strip() for s in text.split("\n\n") if s.strip()]
        if not raw_sections:
            return []

        leaves: list[Chunk] = []
        for section_idx, section_text in enumerate(raw_sections):
            section_id = f"{document_id}_sec{section_idx}"
            paragraphs = [p.strip() for p in section_text.split("\n") if p.strip()]
            for para_idx, para_text in enumerate(paragraphs):
                sentences = sentence_split(para_text)
                if not sentences:
                    continue
                if len(sentences) <= self.window:
                    leaf = Chunk(
                        chunk_id=f"{document_id}_hier_{len(leaves):03d}",
                        document_id=document_id,
                        chunk_strategy=self.strategy,
                        chunk_index=len(leaves),
                        text=para_text,
                        language=language,
                        section=section_id,
                        paragraph_index=para_idx,
                        sentence_indices=list(range(len(sentences))),
                    )
                    leaves.append(leaf)
                else:
                    for sub in self._leaf.chunk(f"{document_id}_p{para_idx}", para_text, language):
                        leaf = Chunk(
                            chunk_id=f"{document_id}_hier_{len(leaves):03d}",
                            document_id=document_id,
                            chunk_strategy=self.strategy,
                            chunk_index=len(leaves),
                            text=sub.text,
                            language=language,
                            section=section_id,
                            paragraph_index=para_idx,
                            sentence_indices=sub.sentence_indices,
                        )
                        leaves.append(leaf)

        # parent / neighbour links
        for i, leaf in enumerate(leaves):
            leaf.metadata["section"] = leaf.section
            leaf.metadata["paragraph_index"] = leaf.paragraph_index
            leaf.metadata["level"] = "leaf"
            if i > 0:
                leaf.prev_chunk_id = leaves[i - 1].chunk_id
            if i < len(leaves) - 1:
                leaf.next_chunk_id = leaves[i + 1].chunk_id
        return leaves
