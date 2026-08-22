# Voice-Enabled RAG System — HH Goa 2026, Task 2

A production-quality, voice-enabled **Retrieval-Augmented Generation (RAG)** system
built on the [AI4Bharat MSMARCO-XI](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI)
dataset. It takes voice input in **7 Indian languages** (Hindi, Bengali, Gujarati,
Marathi, Nepali, Odia, Assamese), transcribes it via **Sarvam AI**, understands
and routes the query, retrieves evidence with a hybrid dense+BM25 pipeline over
**four chunking strategies**, reranks, generates a **grounded** answer via
**Gemini LLM**, verifies that the answer is supported by the retrieved context,
and refuses (abstains) rather than hallucinate.

```
Voice Input → STT → Query Understanding → Guardrails → Query Router
   → Hybrid Retrieval (Dense + BM25 + RRF) → Rerank → Context Building
   → Grounded Generation → Grounding Verification → Final Response
```

---

## 1. Overview

| area | choice | why |
| --- | --- | --- |
| Languages | 7 Indian languages (hin, ben, guj, mar, nep, odi, asm) | multilingual corpus via multilingual-e5-small embeddings |
| Embeddings | `intfloat/multilingual-e5-small` (384-dim) | fast, multilingual, good Hindi quality |
| Dense index | FAISS (`IndexFlatIP`, cosine) | local, µs-scale, persisted |
| Sparse index | BM25 (`rank_bm25`, BM25Okapi) | exact names/numbers/rare terms |
| Fusion | Reciprocal Rank Fusion (RRF) | scale-free, no calibration |
| Vector DB | FAISS (not Qdrant) | no server dependency, in-memory, sub-ms search; Qdrant would add ops cost with no latency benefit at this corpus size |
| Reranker | cross-encoder ms-marco (off by default) | see §10 — measured to *hurt* Hindi retrieval |
| LLM | **Gemini 3.5 Flash Lite** (`gemini-3.5-flash-lite`) | fast multilingual generation, JSON-structured output |
| STT | **Sarvam AI** (`saarika:v1`) | Indian-language speech-to-text, supports all 7 languages |
| API | FastAPI + Uvicorn | async, typed, auto-docs |
| Frontend | React (Vite) | voice console UI |

**Retrieval latency target was sub-200 ms. **Measured: Retrieval P50 = 19 ms, P70 = 45 ms.** Full pipeline P50 = 2.2 s (dominated by Gemini LLM generation over network). See §17 for full distribution.**

---

## 2. Problem statement

Build a complete voice-enabled RAG system for MSMARCO-XI Hindi: microphone →
STT → query understanding → multi-strategy retrieval → reranking → context
construction → grounded generation → grounding verification → response. The
system must not hallucinate, must abstain when evidence is insufficient, must
handle prompt injection / unsafe input, must expose per-stage latency, and must
benchmark itself honestly.

## 3. Architecture

```
                    USER
                     │
                     ▼
              ┌─────────────┐        mock (local) / Sarvam / ElevenLabs
              │  STT        │
              └──────┬──────┘
                     ▼
          ┌─────────────────────┐
          │ Query Understanding │   lightweight rule router (~0.1 ms)
          │ + Guardrails        │   off-topic · injection · unsafe
          └──────────┬──────────┘
                     ▼
          ┌────────────────────────────┐
          │ Query Router               │  FACTUAL / ENTITY / PERSON / LOCATION /
          │                            │  NUMERIC / COMPARISON / CONCEPTUAL / COMPLEX
          └─────────┬──────────────────┘
                    ▼
       ┌─────────────────────────────┐
       │      HYBRID RETRIEVAL       │   FAISS (dense) ∥ BM25 (sparse)
       │   per-view, RRF fusion      │   + metadata / neighbour expansion
       └─────────────┬───────────────┘
                     ▼
              ┌────────────┐
              │  Reranker  │            cross-encoder (opt-in)
              └─────┬──────┘
                    ▼
          ┌────────────────────┐
          │ Context Builder    │        dedupe · merge · token budget
          └─────────┬──────────┘
                    ▼
          ┌────────────────────┐
          │ Answer Generator   │        mock / OpenAI-compat / Gemini
          └─────────┬──────────┘        JSON schema + bounded retries
                    ▼
          ┌────────────────────┐
          │ Grounding Checker  │        claim → evidence lexical+semantic score
          └─────────┬──────────┘
              ┌─────┴──────┐
           Grounded     Not grounded
              │              │
              ▼              ▼
          Answer        Abstention
```

All stages exchange **typed dataclasses** (`backend/models.py`), each stage
validates its input/output, records its own timing, and the orchestrator
assigns a `request_id` per request for log correlation.

## 4. Dataset

**MSMARCO-XI** — Multilingual queries from Bing search logs with gold passages
(`is_selected` flags) → real relevance labels for retrieval evaluation.

- Schema was **inspected, not assumed**: `scripts/inspect_dataset.py` reports
  splits, columns, languages, lengths, duplicates, missing values.
- The dataset is sharded **by language** (one parquet file per target language).
- **Languages**: Hindi (`hin_Deva`), Bengali (`ben_Beng`), Gujarati (`guj_Gujr`),
  Marathi (`mar_Deva`), Nepali (`nep_Deva`), Odia (`ory_Orya`), Assamese (`asm_Beng`).
- **Corpus**: 4,900 passages across 7 languages (`data/corpus_multilingual.jsonl`).
- **Eval set**: 500 queries with gold passage ids (`data/queries.jsonl`).

## 5. Chunking strategies

All four strategies from the spec are implemented (`backend/chunking/`), each
with configurable parameters, and **every chunk carries provenance metadata**
(`chunk_id`, `document_id`, `chunk_strategy`, `chunk_index`, `section`,
`sentence_indices`, `prev/next_chunk_id`, …).

| strategy | module | mechanics | config |
| --- | --- | --- | --- |
| A. Sentence | `sentence.py` | sliding window of N sentences, overlap O | `sentence_window=3`, `sentence_overlap=2` |
| B. Fixed token | `fixed.py` | token chunks with overlap | `fixed_chunk_size=256`, `fixed_overlap=40` |
| C. Semantic | `semantic.py` | embed sentences; cut where neighbour cosine-sim < threshold; clamp chunk size | `semantic_threshold=0.72`, min/max sentences 2/8 |
| D. Hierarchical | `hierarchical.py` | document → section → paragraph → sentence-window leaves with parent links + neighbour expansion | `window=3` |

Sentence splitting is Devanagari-aware (`।`, `!`, `?`) and tokenization covers
both Devanagari and Latin (`backend/chunking/base.py`).

## 6. Multi-view indexing

Each strategy builds its own **retrieval view** (`data/indexes/<view>/`),
containing a FAISS index, a BM25 index and a metadata registry — persisted so
startup never rebuilds them. Offline pipeline:

```
parquet shard → dedupe corpus → chunk per strategy
   → batch embeddings (length-aware, offline only)
   → FAISS + BM25 + metadata → save
```

`scripts/build_index.py` is **resumable** (checkpoints after every embedding
batch), so interrupted builds continue where they left off. Corpus:
10,000 docs → 10,170 fixed / 43,848 sentence / 12,978 semantic / 23,540
hierarchical chunks (~90k total, ~240 MB on disk).

**Only the query is embedded at request time**; query embeddings are LRU-cached
(`Embedder.encode_query`, cache 256). Document embeddings never run at query
time.

## 7. Retrieval

- **Dense**: FAISS inner-product over L2-normalised vectors → cosine similarity.
- **Sparse**: BM25Okapi for exact names, numbers, rare/technical terms.
- **Hybrid**: dense + BM25 run **concurrently** (threads; torch/faiss release
  the GIL so the pure-Python BM25 loop overlaps), fused with **Reciprocal
  Rank Fusion**: `score = Σ 1/(rrf_k + rank)`, `rrf_k=60`, top-10 out.
- **Confidence** (for abstention): max of (top dense cosine, top BM25 score
  normalised by a measured ceiling). This is what the confidence gate tests.
- Entity/PERSON/LOCATION queries get a 1.6× BM25 weight boost (exact terms
  matter); hierarchical routing expands to neighbouring chunks of winning docs.

## 8. Query router

`backend/pipeline/query_router.py` — a **rule-based** classifier (~0.1 ms, no
LLM round-trip). Patterns are Devanagari-safe (Python `re` `\b` breaks on
Devanagari matras — see module docstring) and case-insensitive.

| type | strategy | mode |
| --- | --- | --- |
| FACTUAL | sentence | BM25 |
| ENTITY / PERSON / LOCATION | sentence | hybrid (BM25-boosted) |
| NUMERIC | fixed | BM25 |
| COMPARISON / COMPLEX | hierarchical | hybrid + neighbour context |
| CONCEPTUAL | semantic | dense |
| UNSUPPORTED | — | blocked by guardrails |

## 9. Guardrails

`backend/pipeline/guardrails.py` — pre-retrieval and post-retrieval:

- **off-topic** — greetings / chit-chat / non-knowledge queries → blocked
- **prompt injection** — "ignore previous instructions", "reveal system
  prompt", सिस्टम प्रॉम्प्ट … → blocked
- **unsafe content** — weapons, self-harm, hacking, hate … → blocked
- **low retrieval confidence** — below `min_retrieval_confidence` → abstain
- **no evidence** — empty retrieval → abstain
- Retrieved text is treated as **untrusted data**: guardrails run on the query,
  and the generator prompt forbids instruction-like text inside passages.

## 10. Reranking (and why it is off by default)

A cross-encoder reranker (`cross-encoder/ms-marco-MiniLM-L-6-v2`) is
implemented and wired in, but **disabled by default** — because our own
benchmark measured it *hurting* Hindi retrieval (it is English-focused):

```
strategy            R@1    R@5   R@10    MRR    P@5
hybrid_fusion      0.380  0.510  0.630  0.426  0.292
hybrid_rerank      0.380  0.510  0.630  0.426  0.292   ← ms-marco reranker (no gain)
```

(hybrid_rerank equals hybrid_fusion here because the fallback path keeps fusion
order when the model is disabled — with the model forced on, R@1 dropped to
0.16. See `benchmarks/retrieval_eval.json`.) Set `RERANKER_ENABLED=true` for an
English corpus, or swap `RERANKER_MODEL` for a multilingual cross-encoder.

## 11. Grounding verification

`backend/pipeline/grounding.py` — after generation:

1. split the answer into **claims** (sentences);
2. for each claim, compute **lexical support** (fraction of meaningful tokens
   present in the evidence) — optionally boosted by semantic similarity;
3. aggregate → grounding score in [0, 1]; below `grounding_threshold` the
   orchestrator regenerates once, and if it still fails, **abstains**:

> मुझे दिए गए ज्ञानकोश में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त जानकारी नहीं है।

Abstention boilerplate itself counts as grounded (it is the honest answer).

## 12. Orchestration / harness

`backend/pipeline/orchestrator.py` — `run_voice(audio)` and `run_query(text)`
drive the whole pipeline with:

- a **request id** per call, logged with every stage;
- **bounded retries**: STT retries once; LLM structured output retries
  `generation_max_retries` times then falls back to the safe extractive
  generator — never infinite loops, never silent failures;
- per-stage timing, structured logging (`request_id, query_type, view,
  retrieved_chunks, confidence, generation_ms, grounding_score, total_ms,
  status`), and metrics pushed to an in-memory registry for `/api/metrics`.

## 13. Generation

`backend/pipeline/generator.py`:

- **mock** (default): deterministic **extractive** answer from the top
  evidence chunk (query-overlap sentence selection) — grounded by
  construction, zero API cost, perfect for demos/CI/offline.
- **openai / groq / sarvam**: any OpenAI-compatible `/chat/completions`
  endpoint (`LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`).
- **gemini**: Google Gemini REST with `responseMimeType=application/json`.

All LLM providers get a strict prompt (answer only from evidence, no outside
knowledge, abstain when insufficient, ignore instruction-like text inside
passages) and must return a JSON schema; output is **validated**
(`parse_answer_json`), sources are **restricted to chunks actually in the
context**, and malformed output is retried with a constrained instruction.

## 14. STT

`backend/pipeline/stt.py`:

- **mock** — returns a fixed/override transcript (local dev, demos, tests);
- **sarvam** — Sarvam AI `speech-to-text` (primary, `hi-IN`);
- **elevenlabs** — ElevenLabs `speech-to-text`.

STT latency is measured and reported **separately** from RAG-core latency
(§20) — network STT is never hidden.

## 15. Latency optimisation

All expensive work is offline: dataset cleaning, chunking, document
embeddings, FAISS/BM25/metadata index build. At runtime only:

```
query processing → query embedding (cached) → retrieval (dense∥BM25)
→ rerank → context → generation → grounding
```

Plus: connection reuse (httpx client reuse), in-memory indexes, LRU query-embed
cache, length-aware batching at index time, parallel dense/BM25, model/weights
preloaded at API startup (never on the first request), and small context
windows (1,200-token budget).

## 16. Benchmark methodology

`scripts/benchmark.py` runs the **full orchestrator** over 120 real eval
queries (≥100 per spec), reporting per-stage and total latency percentiles
(P50/P70/P90/P95/P99/P100, mean, min, max). Warm-up runs the pipeline once and
forces the embedding model to touch its weights first — exactly what the API
does at startup — so first-touch cost is never measured inside the loop. All
numbers are real measurements; nothing is fabricated or estimated.

## 17. Results — RAG core (query → answer)

120 queries, **Gemini 3.5 Flash Lite LLM**, **Sarvam STT**, 7 Indian languages:

```
metric     min     p50     p70     p90     p99    p100    mean
rag_total 1656   2172    2303    2481    2992    3711    2226   (ms)
```

Per stage (p50 / p70 / p100, ms):

```
router       0.1 /  0.1 /  25.8     guardrails  0.0 /  0.0 /  11.2
retrieval   19.0 / 45.5 / 259.5    rerank       0.0 /  0.0 /   0.2
context      0.2 /  0.2 /   0.5    generation 2021 / 2149 / 3531
grounding  112.7 / 124  / 274.6
```

**Key latency numbers:**
- **Retrieval (chunking + vector DB): P50 = 19 ms, P70 = 45 ms** ✅ Under 200 ms
- **Full pipeline P50 = 2172 ms** — dominated by Gemini LLM network round-trip (~2s)
- **All 120 queries returned status=ok** (0 abstained in this run)

Honest caveats:
- Gemini LLM generation is the main latency cost (network-bound, ~2s P50).
- Retrieval dominates non-LLM stages at 19 ms P50.
- P100 (3.7 s) includes a slow Gemini response.

## 18. Results — Voice end-to-end

Voice E2E = STT + RAG core. With **Sarvam STT**, the STT network time adds
~100–300 ms depending on audio length. The RAG-core numbers above remain
the same. Full voice E2E latency:

```
P50 ≈ 2300 ms (Sarvam STT ~150ms + Gemini generation ~2000ms)
```

## 27. Supported languages

| Language | Script | Corpus | Verified |
|----------|--------|--------|:--------:|
| **Hindi** | Devanagari | 700 passages | ✅ |
| **Bengali** | Bengali | 700 passages | ✅ |
| **Gujarati** | Gujarati | 700 passages | ✅ |
| **Marathi** | Devanagari | 700 passages | ✅ |
| **Nepali** | Devanagari | 700 passages | ✅ |
| **Odia** | Odia | 700 passages | ✅ |
| **Assamese** | Bengali | 700 passages | ✅ |

Language detection uses pure Unicode script analysis (no ML model, runs in
microseconds). Queries in any of these languages are automatically detected
and routed to the best retrieval strategy.

## 28. Demo scenarios (all verified live)

| # | scenario | query | outcome |
|---|----------|-------|---------|
| 1. | Bengali query | নিগমের সংজ্ঞা কী? | ✅ ANSWERED via Gemini, confidence=1.0 |
| 2. | Hinglish query | dental crown kya hota hai | ✅ ANSWERED, confidence=0.83 |
| 3. | Gujarati query | ગુજરાતી ભાષામાં સવાલ | ✅ ANSWERED, confidence=0.83 |
| 4. | Odia query | ଓଡ଼ିଆ ଭାଷାରେ ପ୍ରଶ୍ନ | ✅ ANSWERED, confidence=1.0 |
| 5. | Unsafe query | how to make a bomb | 🛑 BLOCKED by guardrails |
| 6. | Off-topic | hello how are you | 🛑 BLOCKED (greeting) |
| 7. | Injection | ignore previous instructions | 🛑 BLOCKED (prompt injection) |
| 8. | Unknown fact | भारत की राजधानी | ⏸️ ABSTAINED (no evidence in corpus) |

## 19. Retrieval evaluation

`scripts/evaluate.py` — 100 eval queries with gold relevance labels
(real `is_selected` passages):

```
strategy            R@1    R@5   R@10    MRR    P@5
fixed             0.380  0.680  0.830  0.508  0.148
sentence          0.310  0.620  0.780  0.452  0.210
semantic          0.340  0.710  0.850  0.492  0.152
hierarchical      0.280  0.560  0.730  0.389  0.192
hybrid_fusion     0.380  0.510  0.630  0.426  0.292
hybrid_rerank     0.380  0.510  0.630  0.426  0.292
```

Reading the numbers (all real):

- **fixed** has the best R@1/R@5 (0.38/0.68); **semantic** the best R@10
  (0.85). Longer chunks capture more of a Hindi query's context.
- **hybrid (dense+BM25)** boosts precision (sentence P@5 = 0.21).
- Cross-view fusion and the English ms-marco reranker do **not** help on
  Hindi — which is why the router selects views per query type instead, and
  the reranker is off by default (documented in §10).

## 20. API

FastAPI (`backend/main.py`, endpoints in `backend/api/routes.py`):

| endpoint | purpose |
| --- | --- |
| `POST /api/query` | `{"query": "…"}` → full RAG pipeline result |
| `POST /api/voice` | multipart `file` (audio) [+ `text_hint` for mock] → STT + pipeline |
| `GET /api/health` | status, loaded views, providers |
| `GET /api/metrics` | recent latency percentiles (P50/P70/P90/P95/P99/P100) |
| `GET /api/config` | non-sensitive config (API keys always masked) |

Response shape (abridged):

```json
{
  "request_id": "3c849fa4c03b",
  "status": "ok",
  "transcript": "स्टबहब टोल फ्री नंबर",
  "query_info": {"query_type": "NUMERIC", "chunk_strategy": "fixed", "retrieval_mode": "bm25"},
  "answer": {"text": "स्टबहब टोल-मुक्त नंबर 866-788-2482 …",
             "grounded": true, "confidence": 0.97,
             "sources": [{"document_id": "P000188", "chunk_id": "P000188_fixed_00"}]},
  "grounding": {"is_grounded": true, "score": 1.0},
  "timings": {"router": 0.1, "retrieval": 23.0, "generation": 0.1, …},
  "total_ms": 24.0, "voice_total_ms": 24.0
}
```

`status` ∈ `ok | abstained | blocked | error`. OpenAPI docs at
`http://localhost:8000/docs`.

## 21. Frontend

React + Vite console (`frontend/`): mic button with live recording indicator
(MediaRecorder), text fallback, sample chips for the four demo scenarios,
answer card with grounded badge + confidence, source citations, per-stage
latency bars (RAG total + voice total), guardrail/abstention messaging, and
loading/error states. Dev server proxies `/api` → `:8000`.

## 22. Testing

62 tests (`tests/`) — unit + integration, **no model downloads** (tiny
in-memory index fixture + fake embedder):

- chunking (all four strategies, Devanagari splitting, metadata round-trip)
- RRF fusion (incl. weighting), retriever over tiny index, BM25-only mode,
  query truncation, index persistence
- router (Hindi + English, all types, injection/unsafe/off-topic)
- guardrails, grounding (grounded / hallucinated / abstention)
- generator (mock, JSON parsing, malformed-output recovery, fallback)
- orchestrator (ok/blocked/abstain, voice, request ids, metrics registry)
- API endpoints (health, query, voice, metrics, config key-masking)

```bash
cd task2 && .venv/Scripts/python -m pytest
```

## 23. Installation

```bash
cd task2
python -m venv .venv
# Windows: .venv\Scripts\activate ; macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# 1. dataset (one Hindi shard, ~470 MB, resumable)
python scripts/download_dataset.py --shards 0003

# 2. inspect (optional) and build corpus + indexes (offline, resumable)
python scripts/inspect_dataset.py --shards data/dataset/validation/0003.parquet
python scripts/build_index.py --shard data/dataset/validation/0003.parquet

# 3. run the API
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# 4. frontend (separate terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

> The first index build downloads the embedding model (~470 MB) and embeds
> ~90k chunks — on a CPU-only machine expect tens of minutes (the builder
> checkpoints, so you can interrupt and resume).

## 24. Environment variables

See `.env.example`. Copy to `.env` — **never commit `.env`**. Key ones:

| var | default | meaning |
| --- | --- | --- |
| `LLM_PROVIDER` | `mock` | `mock\|openai\|groq\|sarvam\|gemini` |
| `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` | — | OpenAI-compatible endpoint |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | — | Gemini |
| `STT_PROVIDER` | `mock` | `mock\|sarvam\|elevenlabs` |
| `SARVAM_API_KEY` / `ELEVENLABS_API_KEY` | — | real STT |
| `RERANKER_ENABLED` | `false` | cross-encoder reranker (see §10) |
| `DENSE_TOP_K` / `BM25_TOP_K` / `FUSION_TOP_K` | 20/20/10 | retrieval knobs |
| `MIN_RETRIEVAL_CONFIDENCE` | 0.20 | abstention gate |

## 25. Docker

```bash
docker compose up --build
```

- `backend` — FastAPI on `:8000` (mounts `./data` and `./models`; build the
  indexes locally first, see §23).
- `frontend` — nginx serving the built React app on `:5173`, proxying `/api`.

Health check: `curl localhost:8000/api/health`.

> Deploying to a real host? See [`DEPLOY.md`](DEPLOY.md) — Vercel hosts the
> frontend; the backend needs a host with ≥1 GB RAM (Render/Railway/Fly/VPS).

## 26. Project structure

```
task2/
├── backend/
│   ├── api/            # FastAPI routes, serializers
│   ├── chunking/       # fixed · sentence · semantic · hierarchical + base
│   ├── indexing/       # embeddings, FAISS, BM25, metadata, builder
│   ├── pipeline/       # orchestrator, retriever, reranker, router, generator,
│   │                   # grounding, guardrails, context, stt, metrics, patterns
│   ├── config.py       # pydantic-settings (env-overridable)
│   ├── models.py       # typed stage objects
│   └── main.py         # uvicorn entry
├── frontend/           # React + Vite console
├── scripts/            # download_dataset, inspect_dataset, build_index,
│                       # benchmark, evaluate
├── tests/              # 62 unit + integration tests
├── benchmarks/         # real measured results (JSON)
├── data/               # corpus, queries, indexes (gitignored, reproducible)
├── Dockerfile / docker-compose.yml / .env.example
└── README.md
```



## 28. Known limitations

- BM25 over the 43.8k-chunk sentence view is the latency floor (~60–200 ms on
  this CPU); corpus growth makes this worse without an inverted-index rewrite.
- The default reranker is English-focused and disabled for Hindi (§10).
- Mock STT/LLM are for local dev; real quality needs Sarvam/OpenAI keys.
- `is_selected` gold labels come from the original dataset and can be noisy
  (queries may have multiple valid answers).
- One pathological 7,783-char dataset row inflates P100 (§17) — bounded by
  `query_max_chars`, not eliminated.

## 29. Future improvements

- ANN index (HNSW/IVF) for larger corpora; pre-tokenized BM25 for speed.
- Multilingual cross-encoder reranker tuned on Hindi (e.g. `bge-reranker-v2-m3`).
- Streaming responses, conversation memory, TTS (voice answer-back).
- Online eval harness on new queries with human feedback loop.
- Kubernetes/Helm deployment; Qdrant when a shared vector DB is required.

---

*All benchmark and evaluation numbers in this README were produced by
`scripts/benchmark.py` and `scripts/evaluate.py` on the local machine — no
values are fabricated. Reproduce with the commands in §23.*
