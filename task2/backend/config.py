"""Central configuration for the RAG system.

Every tunable parameter lives here and can be overridden via environment
variables or a ``.env`` file (see ``.env.example``). No API keys are ever
hard-coded.
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ------------------------------------------------------------------ paths
    project_root: Path = Path(__file__).resolve().parent.parent
    data_dir: Path = Path(__file__).resolve().parent.parent / "data"
    index_dir: Path = Path(__file__).resolve().parent.parent / "data" / "indexes"
    model_cache_dir: Path = Path(__file__).resolve().parent.parent / "models"

    # -------------------------------------------------------------- dataset
    lang: str = "hi"  # target language for corpus + queries (hi = hin_Deva shard)
    max_passages: int = 25_000  # cap on unique passages in the knowledge base
    max_queries: int = 500  # cap on evaluation queries extracted

    # ------------------------------------------------------------ embeddings
    embedding_model: str = "intfloat/multilingual-e5-small"
    embedding_dim: int = 384
    embedding_batch_size: int = 64
    embedding_max_seq_length: int = 384  # truncate long texts at index time

    # -------------------------------------------------------------- chunking
    fixed_chunk_size: int = 256  # tokens
    fixed_overlap: int = 40  # tokens
    sentence_window: int = 3  # sentences per sliding-window chunk
    sentence_overlap: int = 2  # overlapping sentences between neighbours
    semantic_threshold: float = 0.72  # min cos-sim between sentences to stay in one chunk
    semantic_min_chunk_sentences: int = 2
    semantic_max_chunk_sentences: int = 8

    # ------------------------------------------------------------- retrieval
    dense_top_k: int = 20
    bm25_top_k: int = 20
    fusion_top_k: int = 10
    rrf_k: int = 60  # RRF constant
    min_retrieval_confidence: float = 0.20
    bm25_confidence_ceiling: float = 6.0  # raw BM25 score mapped to confidence 1.0
    query_max_chars: int = 512  # truncate pathologically long queries (dataset artifacts)
    retrieval_timeout_s: float = 5.0

    # --------------------------------------------------------------- rerank
    # Default OFF: the English-focused ms-marco cross-encoder measurably
    # degrades Hindi retrieval (see benchmarks/retrieval_eval.json R@1 0.16 vs
    # 0.31 for fusion order). Enable for English corpora or swap in a
    # multilingual reranker via RERANKER_MODEL.
    reranker_enabled: bool = False
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    rerank_top_k: int = 5

    # ------------------------------------------------------------ generation
    llm_provider: str = "mock"  # mock | openai | groq | sarvam | gemini
    llm_api_key: str = ""
    llm_base_url: str = ""  # for openai-compatible endpoints (openai/groq/sarvam)
    llm_model: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    max_context_tokens: int = 1200
    generation_temperature: float = 0.2
    generation_max_retries: int = 2

    # -------------------------------------------------------------- grounding
    grounding_threshold: float = 0.35

    # ------------------------------------------------------------------ stt
    stt_provider: str = "mock"  # mock | sarvam | elevenlabs
    mock_stt_transcript: str = "कॉर्पोरेशन क्या है?"
    sarvam_api_key: str = ""
    sarvam_stt_model: str = "saarika:v1"
    sarvam_language_code: str = "hi-IN"
    elevenlabs_api_key: str = ""
    elevenlabs_stt_model: str = "scribe_v1"

    # ---------------------------------------------------------------- serving
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # ------------------------------------------------------------- properties
    @property
    def corpus_path(self) -> Path:
        return self.data_dir / "corpus.jsonl"

    @property
    def queries_path(self) -> Path:
        return self.data_dir / "queries.jsonl"


settings = Settings()
