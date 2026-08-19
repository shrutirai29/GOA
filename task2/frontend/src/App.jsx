import React, { useCallback, useEffect, useRef, useState } from "react";
import { config as fetchConfig, health as fetchHealth, query, voice } from "./api.js";

const SAMPLES = [
  { label: "Voice query", text: "स्टबहब टोल फ्री नंबर" },
  { label: "Exact/entity", text: "फ्रैंक गिफोर्ड ने कितनी महिलाओं से शादी की" },
  { label: "Off-topic", text: "नमस्ते" },
  { label: "Unsafe", text: "बम कैसे बनाएं" },
];

const STAGE_LABELS = {
  stt: "STT",
  router: "Router",
  guardrails: "Guardrails",
  retrieval: "Retrieval",
  rerank: "Rerank",
  context: "Context",
  generation: "Generation",
  grounding: "Grounding",
};

const STATUS_META = {
  ok: { cls: "ok", label: "ANSWERED" },
  abstained: { cls: "abstain", label: "ABSTAINED" },
  blocked: { cls: "blocked", label: "BLOCKED" },
  error: { cls: "error", label: "ERROR" },
};

function fmt(ms) {
  if (ms == null) return "–";
  return ms < 10 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`;
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ status: "offline" }));
    fetchConfig().then(setCfg).catch(() => {});
  }, []);

  const stopRecording = useCallback(() => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const rec = mediaRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.stop();
  }, []);

  const startRecording = async () => {
    setError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setBusy(true);
        voice(blob, hint.trim())
          .then(setResult)
          .catch((e) => setError(e.message))
          .finally(() => setBusy(false));
      };
      rec.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError(`Microphone unavailable: ${e.message}`);
    }
  };

  const submitText = async (text) => {
    if (!text.trim() || busy) return;
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const res = await query(text.trim());
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const meta = result ? STATUS_META[result.status] || STATUS_META.error : null;
  const timings = result?.timings || {};
  const maxStage = Math.max(1, ...Object.keys(STAGE_LABELS).map((k) => timings[k] || 0));

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <header className="topbar">
        <div className="brand">
          <span className="logo">◉</span>
          <div>
            <h1>Voice RAG Console</h1>
            <p>HH Goa 2026 · Task 2 · MSMARCO-XI (हिन्दी)</p>
          </div>
        </div>
        <div className="health">
          <span className={`dot ${health?.status === "ok" ? "up" : "down"}`} />
          {health?.status === "ok" ? "service online" : "service offline"}
          {cfg && (
            <span className="chip">
              {cfg.generation.provider} LLM · {cfg.stt.provider} STT · rerank {cfg.reranker.enabled ? "on" : "off"}
            </span>
          )}
        </div>
      </header>

      <main className="console">
        <section className="input-panel glass-card">
          <div className="mic-row">
            <button
              className={`mic ${recording ? "recording" : ""} ${busy ? "busy" : ""}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={busy}
              title={recording ? "Stop recording" : "Record a question"}
            >
              {recording ? "■" : "🎤"}
            </button>
            <div className="mic-state">
              {recording ? (
                <span className="rec-label">● RECORDING {recSeconds}s — speak now</span>
              ) : busy ? (
                <span className="busy-label">processing…</span>
              ) : (
                <span className="idle-label">click the mic or type below</span>
              )}
            </div>
          </div>

          <div className="text-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitText(input)}
              placeholder="Type a Hindi/English question…"
              disabled={busy}
            />
            <button className="send" onClick={() => submitText(input)} disabled={busy || !input.trim()}>
              Ask
            </button>
          </div>

          <label className="hint-row">
            <input
              className="hint-input"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="(dev) mock-STT transcript override"
            />
          </label>

          <div className="samples">
            {SAMPLES.map((s) => (
              <button key={s.label} className="sample" onClick={() => submitText(s.text)} disabled={busy}>
                {s.label}
              </button>
            ))}
          </div>

          {error && <div className="error-banner">⚠ {error}</div>}
        </section>

        {result && (
          <section className="result-panel glass-card">
            <div className="result-head">
              <span className={`status ${meta.cls}`}>{meta.label}</span>
              <span className="reqid">#{result.request_id}</span>
            </div>

            {result.transcript && (
              <div className="block">
                <h3>TRANSCRIPT</h3>
                <p className="mono">{result.transcript}</p>
              </div>
            )}

            {result.query_info && (
              <div className="block">
                <h3>QUERY TYPE</h3>
                <div className="badges">
                  <span className="badge">{result.query_info.query_type}</span>
                  <span className="badge dim">{result.query_info.chunk_strategy} view</span>
                  <span className="badge dim">{result.query_info.retrieval_mode} retrieval</span>
                </div>
              </div>
            )}

            {result.status === "ok" && result.answer ? (
              <>
                <div className="block">
                  <h3>ANSWER</h3>
                  <p className="answer-text">{result.answer.text}</p>
                  <div className="answer-meta">
                    <span className={`badge ${result.answer.grounded ? "grounded" : ""}`}>
                      {result.answer.grounded ? "grounded ✓" : "ungrounded"}
                    </span>
                    <span className="conf">confidence {(result.answer.confidence * 100).toFixed(0)}%</span>
                    <span className="provider">{result.answer.provider}</span>
                  </div>
                </div>

                {result.answer.sources?.length > 0 && (
                  <div className="block">
                    <h3>SOURCES</h3>
                    <ul className="sources">
                      {result.answer.sources.map((s, i) => (
                        <li key={i}>
                          <span className="doc">Document {s.document_id}</span>
                          {s.chunk_id && <span className="dim">· {s.chunk_id}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.grounding && (
                  <div className="block">
                    <h3>GROUNDING</h3>
                    <p>
                      score <b>{result.grounding.score.toFixed(2)}</b> · {result.grounding.method}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="block">
                <h3>SYSTEM RESPONSE</h3>
                <p className="abstain-text">
                  {result.status === "blocked" && "Request blocked by guardrails."}
                  {result.status === "abstained" && "Abstained — no reliable answer from the knowledge base."}
                  {result.status === "error" && "Pipeline error — please retry."}
                </p>
                {result.status_message && <p className="reason">{result.status_message}</p>}
                {result.status === "abstained" && (
                  <p className="abstain-body">
                    मुझे दिए गए ज्ञानकोश में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त जानकारी नहीं है।
                  </p>
                )}
              </div>
            )}

            {result.retrieval && (
              <div className="block">
                <h3>RETRIEVAL</h3>
                <p>
                  {result.retrieval.view} · {result.retrieval.num_chunks} chunks · confidence{" "}
                  <b>{result.retrieval.confidence.toFixed(2)}</b>
                </p>
              </div>
            )}

            <div className="block">
              <h3>LATENCY</h3>
              <div className="latency">
                {Object.keys(STAGE_LABELS)
                  .filter((k) => timings[k] != null)
                  .map((k) => (
                    <div key={k} className="lat-row">
                      <span className="lat-name">{STAGE_LABELS[k]}</span>
                      <div className="lat-track">
                        <div
                          className="lat-bar"
                          style={{ width: `${Math.max(3, (timings[k] / maxStage) * 100)}%` }}
                        />
                      </div>
                      <span className="lat-val">{fmt(timings[k])}</span>
                    </div>
                  ))}
                <div className="lat-row total">
                  <span className="lat-name">RAG TOTAL</span>
                  <div className="lat-track">
                    <div className="lat-bar total" style={{ width: "100%" }} />
                  </div>
                  <span className="lat-val">{fmt(result.total_ms)}</span>
                </div>
                <div className="lat-row total">
                  <span className="lat-name">VOICE TOTAL</span>
                  <div className="lat-track">
                    <div className="lat-bar voice" style={{ width: "100%" }} />
                  </div>
                  <span className="lat-val">{fmt(result.voice_total_ms)}</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
