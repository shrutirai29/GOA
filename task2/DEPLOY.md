# Deploying the Voice-Enabled RAG System

**TL;DR** — Vercel can host the *frontend* (it's a static React app) but
**cannot host the backend**: the RAG service needs ~1 GB+ RAM and ~700 MB of
local assets (torch, the 470 MB embedding model, ~240 MB of indexes), which
blows past Vercel's serverless function size/memory/time limits. So the
standard split is:

```
Vercel (frontend, free)  ──/api──▶  Render / Railway / Fly.io / VPS (backend)
```

No CORS changes are needed — the backend already allows cross-origin calls
(`allow_origins=["*"]` in `backend/api/routes.py`).

## 0. Order of operations

1. Deploy the **backend** first and note its public URL (e.g.
   `https://rag-backend.onrender.com`).
2. Deploy the **frontend** to Vercel with `VITE_API_TARGET` set to that URL.
3. Health-check the backend: `curl https://rag-backend.onrender.com/api/health`

---

## 1. Backend (needs a real host)

### Why not Vercel
- Vercel Python functions are capped at ~250 MB (hobby) / ~500 MB (pro) of
  total function size; the embedding model alone is 470 MB, torch is larger.
- Functions are short-lived and RAM-limited; a long-running FastAPI service
  holding FAISS + BM25 + a torch model in memory doesn't fit that model.

### The three things every backend host must solve
1. **RAM ≥ 1 GB** — 470 MB model + ~240 MB indexes + torch runtime.
2. **The data** — `data/` is gitignored by design, and the Dockerfile expects
   it at `/app/data`. Options:
   - *Commit it* (simplest for a demo; adds ~250 MB to the repo), or
   - *Build it on first boot* on the host (slow — tens of minutes — and needs
     the 470 MB parquet shard too), or
   - *VPS*: `scp` the whole `task2/data` and `task2/models` folders once
     (recommended for real use).
3. **The model download** — `intfloat/multilingual-e5-small` (~470 MB) is
   fetched on first index build / first load; cache it on the host.

### Render (blueprint included: `render.yaml`)
- Connect the GitHub repo → Root Directory `task2` → runtime Docker.
- Pick a plan with **≥ 1 GB RAM** (free/starter 512 MB is too small).
- Health check path: `/api/health`.
- Get `data/` onto the host (see above); keep `LLM_PROVIDER=mock` /
  `STT_PROVIDER=mock` or add real keys as env vars.

### Alternatives
- **Railway** — Docker deploys with per-service RAM up to 2 GB; same data
  story.
- **Fly.io** — free allowance (3 × shared-cpu-1x VMs ≈ 256 MB each; combine
  into one 1 GB VM); persistent volumes can hold `data/`; same data story.
- **VPS (Hetzner ~€4/mo, 4 GB RAM)** — the most reliable choice for this
  workload: copy the prebuilt venv + data, run with systemd.

---

## 2. Frontend → Vercel (free)

### Option A — CLI (one-off)
```bash
cd task2/frontend
npm install -g vercel   # then log in (opens a browser)
vercel login
vercel --prod
```
Then attach the backend URL and redeploy:
```bash
vercel env add VITE_API_TARGET production   # paste https://your-backend-url
vercel --prod
```

### Option B — Git integration (recommended; auto-deploys on push)
1. Commit & push this repo to GitHub.
2. Vercel dashboard → **Add New Project** → import the repo.
3. Framework Preset: **Vite**; Root Directory: **task2/frontend**.
4. Environment Variable: `VITE_API_TARGET = https://your-backend-url`
   (Production).
5. **Deploy**. Every subsequent `git push` redeploys.

How the wiring works: the frontend always calls `/api/...` (relative). With
`VITE_API_TARGET` set at build time, `frontend/src/api.js` prefixes the
backend URL; without it, the app assumes same-origin (the Docker/nginx setup).

---

## 3. Verify

- Open the Vercel URL and ask a Hindi question (the sample chips work well).
- The answer card shows grounding + sources; the config chip shows the active
  providers (mock by default).
- Backend logs live in your host's dashboard (`/api/metrics` shows latency
  percentiles).
