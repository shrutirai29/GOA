"""Entry point for the RAG service.

Run with::

    uvicorn backend.main:app --host 0.0.0.0 --port 8000
"""

from backend.api.routes import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn

    from backend.config import settings

    uvicorn.run("backend.main:app", host=settings.host, port=settings.port, log_level=settings.log_level.lower())
