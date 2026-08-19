"""Guardrails.

Enforced *before* generation (pre-retrieval) and *after* retrieval:

* off-topic / unsupported queries → blocked with a safe refusal
* prompt-injection attempts → blocked
* unsafe / harmful requests → blocked
* low retrieval confidence → abstention (do not attempt to answer)
* empty or degenerate transcripts → blocked

Retrieved documents are treated as untrusted data: guardrail rules run against
the query, never against injected instructions inside passages, and the
generator prompt explicitly tells the model that retrieved text is data, not
instructions.
"""

from __future__ import annotations

from backend.models import GuardrailResult, QueryInfo, RetrievalResult, UNSUPPORTED
from backend.pipeline.patterns import ATTACK, OFFTOPIC, SAFETY


class Guardrails:
    def check_query(self, query: str, query_info: QueryInfo) -> GuardrailResult:
        """Pre-retrieval checks. ``allowed=False`` blocks the pipeline."""
        if not query.strip():
            return GuardrailResult(allowed=False, category="empty", reason="Empty query.")
        if ATTACK.search(query):
            return GuardrailResult(
                allowed=False,
                category="prompt_injection",
                reason="Query attempts to override system instructions or reveal the prompt.",
            )
        if SAFETY.search(query):
            return GuardrailResult(
                allowed=False,
                category="unsafe",
                reason="Query appears to request harmful or unsafe content.",
            )
        if query_info.query_type == UNSUPPORTED:
            if OFFTOPIC.search(query):
                return GuardrailResult(
                    allowed=False,
                    category="off_topic",
                    reason="Query is outside the knowledge base (chit-chat / greeting).",
                )
            return GuardrailResult(
                allowed=False,
                category="unsupported",
                reason="Query is not a knowledge question answerable from the corpus.",
            )
        return GuardrailResult(allowed=True)

    def check_retrieval(self, retrieval: RetrievalResult, min_confidence: float) -> GuardrailResult:
        """Post-retrieval checks. A low-confidence result → abstention."""
        if not retrieval.chunks:
            return GuardrailResult(
                allowed=False,
                category="no_evidence",
                reason="No evidence retrieved for this query.",
            )
        if retrieval.confidence < min_confidence:
            return GuardrailResult(
                allowed=False,
                category="low_confidence",
                reason=(
                    f"Retrieval confidence {retrieval.confidence:.2f} is below the "
                    f"abstention threshold ({min_confidence:.2f})."
                ),
                details={"confidence": retrieval.confidence},
            )
        return GuardrailResult(allowed=True)
