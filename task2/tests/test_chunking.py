from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.chunking.base import Chunk, sentence_split, tokenize  # noqa: E402
from backend.chunking.fixed import FixedTokenChunker  # noqa: E402
from backend.chunking.hierarchical import HierarchicalChunker  # noqa: E402
from backend.chunking.semantic import SemanticChunker  # noqa: E402
from backend.chunking.sentence import SentenceChunker  # noqa: E402


class DummyEmbedder:
    """Semantic chunker needs sentence vectors; provide constant vectors."""

    dim = 4

    def embed(self, texts):
        import numpy as np

        return np.ones((len(texts), 4), dtype=np.float32)


TEXT = (
    "भारत एशिया में स्थित एक देश है। इसकी राजधानी नई दिल्ली है। "
    "हिमालय उत्तर में है। गंगा एक नदी है। ताजमहल आगरा में है। "
    "मुंबई एक महानगर है। बंगाल की खाड़ी पूर्व में है।"
)


def test_sentence_split():
    sents = sentence_split(TEXT)
    assert len(sents) >= 5
    assert all(s.strip() for s in sents)


def test_tokenize_hindi_and_latin():
    toks = tokenize("स्टबहब टोल फ्री नंबर 866")
    assert "नंबर" in toks
    assert "866" in toks
    assert all(t == t.lower() for t in toks)


def test_fixed_chunker_respects_size_and_overlap():
    chunker = FixedTokenChunker(chunk_size=8, overlap=2)
    chunks = chunker.chunk("d1", TEXT, language="hi")
    assert len(chunks) >= 2
    # overlap: the tail tokens of chunk i appear at the head of chunk i+1
    first_tail = tokenize(chunks[0].text)[-2:]
    second_head = tokenize(chunks[1].text)[:2]
    assert first_tail == second_head
    assert all(isinstance(c, Chunk) for c in chunks)
    assert all(c.document_id == "d1" for c in chunks)


def test_sentence_chunker_sliding_window():
    chunker = SentenceChunker(window=3, overlap=2)
    sents = sentence_split(TEXT)
    chunks = chunker.chunk("d1", TEXT, language="hi")
    assert len(chunks) > 1
    assert chunks[0].sentence_indices == [0, 1, 2]
    assert chunks[1].sentence_indices == [1, 2, 3]  # overlap of 2
    # every sentence is covered by at least one chunk
    covered = [s for c in chunks for s in c.sentence_indices]
    assert set(covered) == set(range(len(sents)))
    # adjacent chunks overlap by exactly `overlap` sentences
    assert chunks[0].sentence_indices[-2:] == chunks[1].sentence_indices[:2]


def test_semantic_chunker_splits_on_boundaries():
    # vectors that drop similarity at sentence 3 → boundary there
    chunker = SemanticChunker(threshold=0.9, min_sentences=2, max_sentences=8)
    sents = sentence_split(TEXT)
    import numpy as np

    vecs = np.ones((len(sents), 4), dtype=np.float32)
    vecs[3:] = -1.0  # sentences 3.. drop similarity with sentence 2
    chunks = chunker.chunk("d1", TEXT, language="hi", sentence_vectors=vecs)
    assert len(chunks) >= 2
    assert all(c.metadata.get("semantic_similarities") for c in chunks)


def test_semantic_chunker_single_sentence():
    chunker = SemanticChunker()
    chunks = chunker.chunk("d1", "केवल एक वाक्य।", language="hi")
    assert len(chunks) == 1
    assert chunks[0].text.strip() == "केवल एक वाक्य।"


def test_hierarchical_chunker_keeps_structure():
    chunker = HierarchicalChunker(window=2)
    text = "पहला भाग।\n\nदूसरा भाग। तीसरा वाक्य। चौथा वाक्य।"
    chunks = chunker.chunk("d1", text, language="hi")
    assert len(chunks) >= 2
    for i, c in enumerate(chunks):
        assert c.section.startswith("d1_sec")
        assert c.metadata["level"] == "leaf"
        if i > 0:
            assert c.prev_chunk_id == chunks[i - 1].chunk_id


def test_chunk_metadata_roundtrip():
    c = Chunk(
        chunk_id="d1_fixed_00",
        document_id="d1",
        chunk_strategy="fixed",
        chunk_index=0,
        text="कुछ पाठ।",
        language="hi",
    )
    d = c.to_dict()
    c2 = Chunk.from_dict(d)
    assert c2.chunk_id == c.chunk_id
    assert c2.token_count == c.token_count
    assert c2.parent_document == "d1"
