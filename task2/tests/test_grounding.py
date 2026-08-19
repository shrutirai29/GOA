from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.models import Context, ContextChunk  # noqa: E402
from backend.pipeline.grounding import GroundingChecker  # noqa: E402

checker = GroundingChecker()


def _ctx(*texts: str) -> Context:
    return Context(
        chunks=[
            ContextChunk(document_id=f"d{i}", chunk_id=f"d{i}_c", text=t, relevance=0.9, source_index=i)
            for i, t in enumerate(texts)
        ],
        total_tokens=0,
    )


def test_grounded_answer_passes():
    ctx = _ctx("स्टबहब एक टिकट बेचने वाली वेबसाइट है। इसका टोल फ्री नंबर 866-788-2482 है।")
    res = checker.verify("स्टबहब का टोल फ्री नंबर 866-788-2482 है।", ctx)
    assert res.is_grounded is True
    assert res.score > checker.threshold


def test_hallucinated_answer_fails():
    ctx = _ctx("स्टबहब एक टिकट बेचने वाली वेबसाइट है।")
    res = checker.verify("स्टबहब की स्थापना 2050 में चंद्रमा पर हुई थी और इसका नंबर 000-000 है।", ctx)
    assert res.is_grounded is False


def test_abstention_boilerplate_is_grounded():
    ctx = _ctx("कुछ असंबंधित पाठ।")
    res = checker.verify(
        "मुझे दिए गए ज्ञानकोश में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त जानकारी नहीं है।", ctx
    )
    assert res.is_grounded is True
    assert res.method == "abstention"


def test_empty_answer_fails():
    res = checker.verify("", _ctx("कुछ पाठ।"))
    assert res.is_grounded is False


def test_claim_scores_recorded():
    ctx = _ctx("नई दिल्ली भारत की राजधानी है।")
    res = checker.verify("नई दिल्ली भारत की राजधानी है।", ctx)
    assert res.claim_scores
    assert len(res.details["claims"]) >= 1
