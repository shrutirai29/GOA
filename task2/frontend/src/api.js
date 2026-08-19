// In dev, Vite proxies /api to the backend (see vite.config.js). In a
// production build, set VITE_API_TARGET to the hosted backend URL, e.g.
//   VITE_API_TARGET=https://rag-backend.onrender.com
// Without it, the app assumes the backend is served from the same origin.
const API_BASE = (import.meta.env.VITE_API_TARGET || "").replace(/\/+$/, "");

async function request(path, options) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      /* keep statusText */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json();
}

export function query(text) {
  return request("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: text }),
  });
}

export function voice(audioBlob, textHint) {
  const form = new FormData();
  form.append("file", audioBlob, "recording.webm");
  if (textHint) form.append("text_hint", textHint);
  return request("/api/voice", { method: "POST", body: form });
}

export function health() {
  return request("/api/health");
}

export function metrics() {
  return request("/api/metrics");
}

export function config() {
  return request("/api/config");
}
