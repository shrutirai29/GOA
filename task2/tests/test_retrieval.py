from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.models import QueryInfo  # noqa: E402
from backend.pipeline.retriever import Retriever, rrf_fuse  # noqa: E402


def test_rrf_fuses_ranked_lists():
    # y is #2 in list a and #1 in list b → beats x (#1 in a only, #3 in b)
    a = [("x", 0.9), ("y", 0.8), ("z", 0.7)]
    b = [("y", 0.5), ("w", 0.4), ("x", 0.3)]
    fused = rrf_fuse([a, b], k=60)
    assert fused[0][0] == "y"
    assert fused[0][1] > fused[1][1]
    assert all(x in [i for i, _ in fused] for x in ("x", "y", "z", "w"))


def test_rrf_weighted_boosts_list():
    # x appears in both lists; y only in b. Zeroing a's weight lets b win.
    a = [("x", 0.9)]
    b = [("y", 0.5), ("x", 0.4)]
    unweighted = rrf_fuse([a, b], k=60)
    weighted = rrf_fuse([a, b], k=60, weights=[0.0, 1.0])
    assert unweighted[0][0] == "x"
    assert weighted[0][0] == "y"  # b's ranking now dominates


def test_retriever_loads_view_and_searches(tiny_index, fake_embedder):
    r = Retriever(view_names=["fixed"], embedder=fake_embedder, index_dir=tiny_index)
    assert r.available_views == ["fixed"]
    qi = QueryInfo(query="स्टबहब टोल फ्री नंबर", query_type="FACTUAL", chunk_strategy="fixed", retrieval_mode="hybrid")
    res = r.retrieve("स्टबहब टोल फ्री नंबर", qi)
    assert len(res.chunks) > 0
    assert res.confidence >= 0.0
    assert "bm25" in res.timings
    assert res.chunks[0].document_id in {"d1", "d2", "d3"}
    # every chunk carries provenance
    for c in res.chunks:
        assert c.chunk_id and c.document_id and c.text


def test_retriever_bm25_only_mode(tiny_index, fake_embedder):
    r = Retriever(view_names=["fixed"], embedder=fake_embedder, index_dir=tiny_index)
    qi = QueryInfo(query="फ्रैंक गिफोर्ड", query_type="PERSON", chunk_strategy="fixed", retrieval_mode="bm25")
    res = r.retrieve("फ्रैंक गिफोर्ड", qi)
    assert res.chunks[0].document_id == "d2"
    assert res.timings["bm25"] > 0
    assert "dense" not in res.timings


def test_retriever_query_truncation(tiny_index, fake_embedder):
    r = Retriever(view_names=["fixed"], embedder=fake_embedder, index_dir=tiny_index)
    long_q = ("स्टबहब " * 5000).strip()
    qi = QueryInfo(query=long_q, query_type="FACTUAL", chunk_strategy="fixed", retrieval_mode="bm25")
    res = r.retrieve(long_q, qi)  # must not blow up
    assert res.chunks  # truncated query still matches d3


def test_vector_index_persistence(tiny_index):
    from backend.indexing.vector_index import VectorIndex

    loaded = VectorIndex.load(tiny_index / "fixed")
    assert loaded.index.ntotal == len(loaded.ids)
    assert all(isinstance(i, str) for i in loaded.ids)
