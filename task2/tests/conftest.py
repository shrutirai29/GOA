"""Shared test fixtures.

The test suite must never download the embedding model or load the 10k-doc
production index. Instead we build a *tiny* index (3 documents, one fixed-size
view) in a temp dir with hand-crafted vectors, and fake the embedder.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.chunking.base import Chunk  # noqa: E402
from backend.chunking.fixed import FixedTokenChunker  # noqa: E402
from backend.indexing.bm25_index import Bm25Index  # noqa: E402
from backend.indexing.metadata_index import MetadataIndex  # noqa: E402
from backend.indexing.vector_index import VectorIndex  # noqa: E402

DOCS = [
    ("d1", "कॉर्पोरेशन एक कानूनी इकाई है जो व्यापार करती है। यह शेयरधारकों के स्वामित्व में होती है।"),
    ("d2", "फ्रैंक गिफोर्ड एक अमेरिकी फुटबॉल खिलाड़ी थे। उनका जन्म सांता मोनिका में हुआ।"),
    ("d3", "स्टबहब एक टिकट बेचने वाली वेबसाइट है। इसका टोल फ्री नंबर 866-788-2482 है।"),
]


class FakeEmbedder:
    """Deterministic dummy embedder; dim=8. encode_query returns the same
    vector every time so dense results are stable across the test run."""

    dim = 8

    def __init__(self) -> None:
        self.query_vec = np.array([1, 0, 0, 0, 1, 0, 0, 0], dtype=np.float32)
        self.query_vec = self.query_vec / np.linalg.norm(self.query_vec)

    def encode_query(self, text: str) -> np.ndarray:
        return self.query_vec

    def encode_passages(self, texts: list[str]) -> np.ndarray:
        rng = np.random.default_rng(42)
        return rng.normal(size=(len(texts), self.dim)).astype(np.float32)

    def embed(self, texts: list[str]) -> np.ndarray:
        return self.encode_passages(texts)


@pytest.fixture
def tiny_index(tmp_path: Path) -> Path:
    """Build a one-view (fixed) index for the 3 test docs; returns index dir."""
    out = tmp_path / "indexes" / "fixed"
    chunker = FixedTokenChunker(chunk_size=16, overlap=2)
    meta = MetadataIndex()
    chunks: list[Chunk] = []
    for did, text in DOCS:
        for c in chunker.chunk(did, text, language="hi"):
            meta.add_chunk(c)
            chunks.append(c)
        meta.add_document(did, text)

    # hand-crafted orthogonal-ish unit vectors for stable dense ranking
    vecs = np.eye(8, dtype=np.float32)[: len(chunks)]
    vec = VectorIndex(8)
    vec.add(vecs, [c.chunk_id for c in chunks])
    vec.save(out)

    bm25 = Bm25Index()
    bm25.build([c.text for c in chunks])
    bm25.save(out)

    meta.save(out)
    return tmp_path / "indexes"


@pytest.fixture
def fake_embedder() -> FakeEmbedder:
    return FakeEmbedder()
