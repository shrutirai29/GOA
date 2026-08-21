"""Orchestration harness.

Ties every stage together with:

* a request ID per call (for log correlation);
* input/output validation at each boundary;
* per-stage timing;
* bounded retries (STT once, LLM structured output N times);
* graceful, explicit failure handling — never silent, never infinite;
* structured objects between stages (see ``backend.models``);
* structured logging (request_id, stage, duration, status).

Pipeline::

    audio → STT → guardrails → router → retrieval → confidence gate
         → rerank → context → generate (retry) → grounding → response

Abstention is a first-class outcome (status="abstained"), not an error.
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from backend.config import settings
from backend.models import GuardrailResult, PipelineResult, RetrievalResult
from backend.pipeline.context import ContextBuilder
from backend.pipeline.generator import AnswerGenerator
from backend.pipeline.grounding import GroundingChecker
from backend.pipeline.guardrails import Guardrails
from backend.pipeline.metrics import registry
from backend.pipeline.query_router import QueryRouter
from backend.pipeline.reranker import Reranker
from backend.pipeline.retriever import Retriever
from backend.pipeline.stt import SttProvider

log = logging.getLogger("rag.orchestrator")

_ABSTENTION = (
    "मुझे दिए गए ज्ञानकोश में इस प्रश्न का विश्वसनीय उत्तर देने के लिए "
    "पर्याप्त जानकारी नहीं है।"
)


class _Timed:
    """tiny per-stage stopwatch used by the harness"""

    def __init__(self) -> None:
        self.timings: dict[str, float] = {}

    def run(self, name: str, fn):
        t0 = time.perf_counter()
        try:
            return fn()
        finally:
            self.timings[name] = (time.perf_counter() - t0) * 1000


class Orchestrator:
    def __init__(
        self,
        retriever: Retriever | None = None,
        router: QueryRouter | None = None,
        reranker: Reranker | None = None,
        generator: AnswerGenerator | None = None,
        grounding: GroundingChecker | None = None,
        guardrails: Guardrails | None = None,
        context_builder: ContextBuilder | None = None,
        stt: SttProvider | None = None,
    ) -> None:
        self.retriever = retriever or Retriever()
        self.router = router or QueryRouter()
        self.reranker = reranker or Reranker()
        self.generator = generator or AnswerGenerator()
        self.grounding = grounding or GroundingChecker()
        self.guardrails = guardrails or Guardrails()
        self.context_builder = context_builder or ContextBuilder()
        self.stt = stt or SttProvider()

    # ------------------------------------------------------------- entrypoint
    def run_voice(self, audio: bytes, *, text_hint: str = "") -> PipelineResult:
        request_id = uuid.uuid4().hex[:12]
        t0 = time.perf_counter()
        clock = _Timed()
        result = PipelineResult(request_id=request_id)

        def transcribe() -> str:
            try:
                return self.stt.transcribe(audio, text_hint=text_hint)
            except Exception as exc:
                # bounded retry: one retry for STT, then controlled error
                log.warning("[%s] stt attempt 1 failed: %s", request_id, exc)
                try:
                    return self.stt.transcribe(audio, text_hint=text_hint)
                except Exception as exc2:
                    # If real STT fails and text_hint is available, use it as fallback
                    if text_hint:
                        log.warning("[%s] STT failed, using text_hint fallback", request_id)
                        return text_hint
                    raise RuntimeError(f"speech-to-text failed after retry: {exc2}") from exc2

        transcript = clock.run("stt", transcribe)
        result.transcript = transcript
        result.timings["stt"] = clock.timings["stt"]
        result.voice_total_ms = (time.perf_counter() - t0) * 1000

        out = self.run_query(transcript, request_id=request_id, _clock=clock)
        out.request_id = request_id
        out.transcript = transcript
        out.voice_total_ms = (time.perf_counter() - t0) * 1000
        out.timings.update({"stt": clock.timings["stt"]})
        return out

    def run_query(self, query: str, *, request_id: str | None = None, _clock: _Timed | None = None) -> PipelineResult:
        request_id = request_id or uuid.uuid4().hex[:12]
        t0 = time.perf_counter()
        clock = _clock or _Timed()
        result = PipelineResult(request_id=request_id, query=query)

        try:
            self._run(query, result, clock)
        except Exception as exc:  # last-resort: no silent failures
            log.exception("[%s] pipeline error: %s", request_id, exc)
            result.status = "error"
            result.error = str(exc)
            result.answer = None

        result.total_ms = (time.perf_counter() - t0) * 1000
        result.timings = {**clock.timings, "total": result.total_ms}
        if result.voice_total_ms == 0.0:
            result.voice_total_ms = result.total_ms

        self._log_and_record(result)
        return result

    # ------------------------------------------------------------- pipeline
    def _run(self, query: str, result: PipelineResult, clock: _Timed) -> None:
        # ---- query understanding + guardrails
        query_info = clock.run("router", lambda: self.router.classify(query))
        result.query_info = query_info
        guardrail: GuardrailResult = clock.run(
            "guardrails", lambda: self.guardrails.check_query(query, query_info)
        )
        result.guardrail = guardrail
        if not guardrail.allowed:
            result.status = "blocked"
            result.messages.append(guardrail.reason)
            result.answer = None
            return

        # ---- retrieval
        retrieval: RetrievalResult = clock.run(
            "retrieval", lambda: self.retriever.retrieve(query, query_info)
        )
        result.retrieval = retrieval

        # ---- post-retrieval confidence gate
        low_conf = clock.run(
            "confidence_gate",
            lambda: self.guardrails.check_retrieval(retrieval, settings.min_retrieval_confidence),
        )
        if not low_conf.allowed:
            result.status = "abstained"
            result.messages.append(low_conf.reason)
            result.answer = None
            return

        # ---- rerank
        reranked = clock.run(
            "rerank",
            lambda: self.reranker.rerank(query, retrieval.chunks, settings.rerank_top_k),
        )
        result.reranked = [
            {"chunk_id": c.chunk_id, "score": c.metadata.get("rerank_score", 0.0)} for c in reranked
        ] if reranked else []

        # ---- context construction
        context = clock.run("context", lambda: self.context_builder.build(reranked))
        result.context = context
        if not context.chunks:
            result.status = "abstained"
            result.messages.append("Context construction produced no evidence.")
            return

        # ---- answer generation with bounded retries inside the generator
        answer = clock.run("generation", lambda: self.generator.generate(query, context))
        result.answer = answer

        # ---- grounding verification
        grounding = clock.run(
            "grounding", lambda: self.grounding.verify(answer.text, context)
        )
        result.grounding = grounding

        if grounding.method == "abstention":
            # LLM says it can't answer — honor that
            result.status = "abstained"
            result.messages.append(answer.text)
            result.answer = None
            return

        if not grounding.is_grounded:
            # regenerate once with the same evidence; if it still fails → abstain
            retry_answer = clock.run(
                "generation_retry", lambda: self.generator.generate(query, context)
            )
            retry_grounding = self.grounding.verify(retry_answer.text, context)
            result.grounding = retry_grounding
            if retry_grounding.is_grounded:
                result.answer = retry_answer
                result.answer.grounded = True  # override LLM self-assessment
            else:
                result.status = "abstained"
                result.answer = None
                result.messages.append(
                    "Generated answer could not be verified against the retrieved evidence."
                )
                return
        else:
            # grounding checker confirms answer is supported by evidence
            result.answer.grounded = True

        result.status = "ok"

    # ------------------------------------------------------------ observability
    def _log_and_record(self, result: PipelineResult) -> None:
        qi = result.query_info
        payload = {
            "request_id": result.request_id,
            "timestamp": time.time(),
            "transcript": result.transcript,
            "query": result.query,
            "query_type": qi.query_type if qi else None,
            "retrieval_strategy": result.retrieval.view if result.retrieval else None,
            "retrieved_chunks": len(result.retrieval.chunks) if result.retrieval else 0,
            "retrieval_confidence": round(result.retrieval.confidence, 4) if result.retrieval else None,
            "generation_ms": round(result.timings.get("generation", 0.0), 1),
            "grounding_score": round(result.grounding.score, 4) if result.grounding else None,
            "total_ms": round(result.total_ms, 1),
            "voice_total_ms": round(result.voice_total_ms, 1),
            "status": result.status,
        }
        log.info("pipeline %s", payload)
        registry.record(payload)
