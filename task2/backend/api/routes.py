"""FastAPI application.

Endpoints:

* ``POST /api/query``  — text query through the full RAG pipeline
* ``POST /api/voice``  — audio → STT → full RAG pipeline (multipart file)
* ``GET  /api/health`` — service + index health
* ``GET  /api/metrics``— recent latency percentiles
* ``GET  /api/config`` — non-sensitive configuration

Model/embeddings/reranker are preloaded at startup (lifespan) so the first
request never pays the model first-touch cost.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.api.serializers import pipeline_result_to_dict
from backend.config import settings
from backend.pipeline.metrics import registry
from backend.pipeline.orchestrator import Orchestrator

log = logging.getLogger("rag.api")

SENSITIVE_KEYS = {"llm_api_key", "gemini_api_key", "sarvam_api_key", "elevenlabs_api_key"}


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)


class _Shared:
    orchestrator: Orchestrator | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("starting up: loading orchestrator (views + models) ...")
    orch = Orchestrator()
    if settings.lightweight_mode:
        log.info("lightweight mode: skipping embedding model (BM25 only)")
    elif orch.retriever.views:
        # force the embedder to touch its weights + index pages now, not on the
        # first user request
        orch.retriever._lazy_embedder().encode_query("warmup")
    _Shared.orchestrator = orch
    log.info("startup complete: %d views", len(orch.retriever.views))
    yield
    _Shared.orchestrator = None


app = FastAPI(title="HH Goa 2026 — Voice RAG", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _orch() -> Orchestrator:
    if _Shared.orchestrator is None:
        raise HTTPException(status_code=503, detail="service not ready")
    return _Shared.orchestrator


# ------------------------------------------------------------------ endpoints
@app.post("/api/query")
def api_query(req: QueryRequest) -> dict[str, Any]:
    result = _orch().run_query(req.query)
    return pipeline_result_to_dict(result)


@app.post("/api/voice")
async def api_voice(
    file: UploadFile = File(...),
    text_hint: str = Form("", description="mock-STT transcript override (testing only)"),
) -> dict[str, Any]:
    audio = await file.read()
    if not audio:
        raise HTTPException(status_code=400, detail="empty audio upload")
    if len(audio) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="audio too large (max 50MB)")
    result = _orch().run_voice(audio, text_hint=text_hint)
    return pipeline_result_to_dict(result)


@app.get("/api/health")
def api_health() -> dict[str, Any]:
    orch = _Shared.orchestrator
    if orch is None:
        return {"status": "starting", "views": []}
    return {
        "status": "ok",
        "views": orch.retriever.available_views,
        "corpus_loaded": bool(settings.corpus_path.exists()),
        "queries_loaded": bool(settings.queries_path.exists()),
        "llm_provider": settings.llm_provider,
        "stt_provider": settings.stt_provider,
        "reranker_enabled": settings.reranker_enabled,
    }


@app.get("/api/metrics")
def api_metrics(limit: int = 500) -> dict[str, Any]:
    return registry.summary(limit=limit)


@app.get("/api/config")
def api_config() -> dict[str, Any]:
    """Non-sensitive config: API keys are never exposed."""
    def safe(name: str) -> str:
        return "***" if getattr(settings, name) else ""

    return {
        "embedding_model": settings.embedding_model,
        "embedding_dim": settings.embedding_dim,
        "chunking": {
            "fixed": {"chunk_size": settings.fixed_chunk_size, "overlap": settings.fixed_overlap},
            "sentence": {"window": settings.sentence_window, "overlap": settings.sentence_overlap},
            "semantic": {
                "threshold": settings.semantic_threshold,
                "min_sentences": settings.semantic_min_chunk_sentences,
                "max_sentences": settings.semantic_max_chunk_sentences,
            },
        },
        "retrieval": {
            "dense_top_k": settings.dense_top_k,
            "bm25_top_k": settings.bm25_top_k,
            "fusion_top_k": settings.fusion_top_k,
            "rrf_k": settings.rrf_k,
            "min_confidence": settings.min_retrieval_confidence,
        },
        "reranker": {"enabled": settings.reranker_enabled, "model": settings.reranker_model},
        "generation": {"provider": settings.llm_provider, "model": settings.llm_model or "(default)"},
        "stt": {"provider": settings.stt_provider, "model": settings.sarvam_stt_model},
        "keys_configured": {
            "sarvam": safe("sarvam_api_key"),
            "elevenlabs": safe("elevenlabs_api_key"),
            "llm": safe("llm_api_key"),
            "gemini": safe("gemini_api_key"),
        },
    }


# ------------------------------------------------------------------ static UI
# If the built React app ships in the image (frontend/dist), serve it from the
# same origin. /api routes are registered above and always take precedence.
_FRONTEND_DIST = settings.project_root / "frontend" / "dist"
if _FRONTEND_DIST.is_dir():
    from fastapi.responses import FileResponse
    from fastapi.staticfiles import StaticFiles

    _INDEX_HTML = _FRONTEND_DIST / "index.html"

    @app.get("/tos")
    def tos_page() -> FileResponse:
        """Serve Terms of Service page (SPA routes to React component)."""
        return FileResponse(str(_INDEX_HTML), media_type="text/html")

    # llms.txt and sitemap.xml served from public/ before the SPA mount
    _PUBLIC = settings.project_root / "frontend" / "public"
    if (_PUBLIC / "llms.txt").exists():
        @app.get("/llms.txt")
        def llms_txt() -> FileResponse:
            return FileResponse(str(_PUBLIC / "llms.txt"), media_type="text/plain")
    if (_PUBLIC / "sitemap.xml").exists():
        @app.get("/sitemap.xml")
        def sitemap() -> FileResponse:
            return FileResponse(str(_PUBLIC / "sitemap.xml"), media_type="application/xml")

    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIST), html=True), name="ui")
