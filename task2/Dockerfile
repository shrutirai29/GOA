# Multi-stage build: Node builds the React frontend, Python serves everything.
# Build:   docker build -t rag-backend .
# Run:     docker run -p 8000:8000 -e GEMINI_API_KEY=... rag-backend

# ── Stage 1: Build React frontend ──
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + built frontend ──
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# system deps: faiss-cpu, soundfile, ffmpeg (for pydub webm→wav)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libsndfile1 ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend ./backend
COPY scripts ./scripts

# knowledge base
COPY data/indexes ./data/indexes
COPY data/corpus_multilingual.jsonl ./data/corpus_multilingual.jsonl
COPY data/queries.jsonl ./data/queries.jsonl

# pre-bake the embedding model
RUN python -c "from huggingface_hub import snapshot_download; snapshot_download('intfloat/multilingual-e5-small', cache_dir='/app/models')"

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
