"""Metadata store for chunks and documents.

Holds the provenance information that makes citations, debug output and
hierarchical parent-expansion possible, without duplicating vector data.
"""

from __future__ import annotations

from pathlib import Path

from backend.chunking.base import Chunk


class MetadataIndex:
    def __init__(self) -> None:
        self.chunks: dict[str, Chunk] = {}  # chunk_id -> chunk
        self.documents: dict[str, str] = {}  # document_id -> original passage text
        self.chunks_by_document: dict[str, list[str]] = {}  # document_id -> [chunk_ids]

    # ------------------------------------------------------------------ build
    def add_chunk(self, chunk: Chunk) -> None:
        self.chunks[chunk.chunk_id] = chunk
        self.chunks_by_document.setdefault(chunk.document_id, []).append(chunk.chunk_id)

    def add_document(self, document_id: str, text: str) -> None:
        self.documents[document_id] = text

    # ----------------------------------------------------------------- lookup
    def get_chunk(self, chunk_id: str) -> Chunk | None:
        return self.chunks.get(chunk_id)

    def get_document(self, document_id: str) -> str | None:
        return self.documents.get(document_id)

    def neighbours(self, chunk_id: str, radius: int = 1) -> list[Chunk]:
        """Surrounding chunks of the same document (for context expansion)."""
        chunk = self.chunks.get(chunk_id)
        if chunk is None:
            return []
        siblings = self.chunks_by_document.get(chunk.document_id, [])
        try:
            pos = siblings.index(chunk_id)
        except ValueError:
            return []
        lo = max(0, pos - radius)
        hi = min(len(siblings), pos + radius + 1)
        return [self.chunks[s] for s in siblings[lo:hi] if s != chunk_id]

    # --------------------------------------------------------------- persist
    def save(self, directory: Path) -> None:
        import json

        directory.mkdir(parents=True, exist_ok=True)
        with open(directory / "chunks.jsonl", "w", encoding="utf-8") as f:
            for chunk in self.chunks.values():
                f.write(json.dumps(chunk.to_dict(), ensure_ascii=False) + "\n")
        with open(directory / "documents.json", "w", encoding="utf-8") as f:
            json.dump(self.documents, f, ensure_ascii=False)

    @classmethod
    def load(cls, directory: Path) -> "MetadataIndex":
        import json

        idx = cls()
        chunks_file = directory / "chunks.jsonl"
        if chunks_file.exists():
            for line in chunks_file.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    idx.add_chunk(Chunk.from_dict(json.loads(line)))
        docs_file = directory / "documents.json"
        if docs_file.exists():
            idx.documents = json.loads(docs_file.read_text(encoding="utf-8"))
        return idx
