# Backend: FastAPI RAG service.
# Build:   docker build -t rag-backend .
# Run:     see docker-compose.yml (`docker compose up --build`)
#
# Self-contained image: the knowledge base (indexes) and the embedding model
# are baked in so boot is instant and no volumes are required — this is what
# makes one-shot deploys (Railway `up`, HF Spaces) work. Locally,
# docker-compose still mounts ./data and ./models over the baked files.
# The container binds $PORT (HF Spaces/Railway convention), falling back to
# 8000 locally.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# system deps for faiss-cpu wheels / soundfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libsndfile1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend ./backend
COPY scripts ./scripts

# knowledge base — indexes are built offline by scripts/build_index.py
# (see data/README); baking them in keeps startup fast
COPY data/indexes ./data/indexes
COPY data/corpus.jsonl ./data/corpus.jsonl
COPY data/queries.jsonl ./data/queries.jsonl

# pre-bake the embedding model so the container never downloads at boot
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download('intfloat/multilingual-e5-small', cache_dir='/app/models')"

# built React frontend (the API serves it at / when present)
COPY frontend/dist ./frontend/dist

EXPOSE 8000
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
