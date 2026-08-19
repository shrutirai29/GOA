"""Grounding verification.

After generation, the answer is *not* trusted on faith. Steps:

1. split the answer into claims (sentences);
2. for each claim, measure how much of it is supported by the retrieved
   context — lexical overlap of meaningful tokens, optionally boosted by
   semantic similarity of the claim against the evidence;
3. aggregate into a grounding score in [0, 1];
4. below the configurable threshold → the orchestrator abstains/regenerates.

Claims that merely restate the abstention message are treated as grounded.
"""

from __future__ import annotations

import re

import numpy as np

from backend.chunking.base import sentence_split, tokenize
from backend.config import settings
from backend.models import Context, GroundingResult

# stopwords that carry little evidence weight (Hindi + English)
_STOP = {
    "का", "की", "के", "को", "से", "में", "पर", "और", "है", "हैं", "था", "थी", "थे",
    "ने", "कि", "यह", "वह", "ये", "वे", "एक", "अपने", "अपनी", "अपना", "करने", "करता",
    "के लिए", "मेरे", "मेरा", "तो", "भी", "ही", "जो", "जिस", "जिन", "कीजिए",
    "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "for", "and",
    "on", "with", "by", "at", "from", "as", "that", "this", "it", "its", "be",
}


def _evidence_tokens(context: Context) -> set[str]:
    toks: set[str] = set()
    for c in context.chunks:
        toks.update(tokenize(c.text))
    return toks


def _content_tokens(text: str) -> list[str]:
    return [t for t in tokenize(text) if t not in _STOP and len(t) > 1]


def _lexical_support(claim: str, evidence: set[str]) -> float:
    toks = _content_tokens(claim)
    if not toks:
        return 1.0
    hits = sum(1 for t in toks if t in evidence)
    return hits / len(toks)


class GroundingChecker:
    def __init__(self, embedder=None) -> None:
        self.embedder = embedder  # optional; semantic support only if provided
        self.threshold = settings.grounding_threshold

    # ------------------------------------------------------------- interface
    def verify(self, answer_text: str, context: Context, use_semantic: bool = True) -> GroundingResult:
        if not answer_text.strip():
            return GroundingResult(is_grounded=False, score=0.0, method="lexical", details={"reason": "empty answer"})

        evidence = _evidence_tokens(context)
        claims = [s for s in sentence_split(answer_text) if s]
        if not claims:
            claims = [answer_text]

        # non-committal abstention boilerplate is grounded by definition
        if _is_abstention(answer_text):
            return GroundingResult(is_grounded=True, score=1.0, method="abstention", details={"claims": claims})

        scores = [_lexical_support(c, evidence) for c in claims]

        semantic_score: float | None = None
        if use_semantic and self.embedder is not None and context.chunks:
            semantic_score = self._semantic_support(claims, context)

        details = {
            "claims": claims,
            "claim_scores": scores,
            "evidence_tokens": len(evidence),
        }
        if semantic_score is not None:
            details["semantic_support"] = round(semantic_score, 4)
            details["method"] = "lexical+semantic"

        if semantic_score is not None:
            score = 0.65 * float(np.mean(scores)) + 0.35 * semantic_score
        else:
            score = float(np.mean(scores))

        return GroundingResult(
            is_grounded=score >= self.threshold,
            score=round(score, 4),
            claim_scores=scores,
            method=details.get("method", "lexical"),
            details=details,
        )

    # ------------------------------------------------------------- semantic
    def _semantic_support(self, claims: list[str], context: Context) -> float:
        """Mean cosine similarity of each claim against its best evidence chunk."""
        claim_vecs = self.embedder.encode_passages(claims)
        chunk_vecs = self.embedder.encode_passages([c.text for c in context.chunks])
        sims = claim_vecs @ chunk_vecs.T  # (n_claims, n_chunks)
        best = sims.max(axis=1)
        return float(np.clip(best, 0.0, 1.0).mean())


def _is_abstention(text: str) -> bool:
    return bool(
        re.search(
            r"(don'?t (have|know)|no (information|enough)|enough information|"
            r"जानकारी (नहीं|नही)|नहीं (जानता|जानती|पता)|पर्याप्त जानकारी|उत्तर नहीं)",
            text,
            re.IGNORECASE,
        )
    )
