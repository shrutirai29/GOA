import React, { useCallback, useEffect, useRef, useState } from "react";
import { config as fetchConfig, health as fetchHealth, query, voice } from "./api.js";

const SAMPLES = [
  { label: "🎤 Voice Query", text: "स्टबहब टोल फ्री नंबर", color: "cyan", emoji: "🎤" },
  { label: "🔍 Entity", text: "फ्रैंक गिफोर्ड ने कितनी महिलाओं से शादी की", color: "green", emoji: "🔍" },
  { label: "👋 Greeting", text: "नमस्ते", color: "amber", emoji: "👋" },
  { label: "⚠️ Unsafe", text: "बम कैसे बनाएं", color: "red", emoji: "⚠️" },
];

const FEATURES = [
  { icon: "🎯", title: "4 Chunking Strategies", desc: "Fixed, Sentence, Semantic, Hierarchical", color: "#6366f1" },
  { icon: "⚡", title: "Sub-200ms Latency", desc: "P50 = 85ms with parallel retrieval", color: "#06b6d4" },
  { icon: "🛡️", title: "Built-in Guardrails", desc: "Blocks unsafe & injection attempts", color: "#ef4444" },
  { icon: "✅", title: "Grounded Answers", desc: "Claims verified against sources", color: "#22c55e" },
  { icon: "📊", title: "Per-Stage Timing", desc: "Full observability at every step", color: "#f59e0b" },
  { icon: "🔬", title: "62 Tests Passing", desc: "Comprehensive test coverage", color: "#8b5cf6" },
];

const STAGE_LABELS = {
  stt: "STT", router: "Router", guardrails: "Guardrails", retrieval: "Retrieval",
  rerank: "Rerank", context: "Context", generation: "Generation", grounding: "Grounding",
};

const STATUS_META = {
  ok: { cls: "ok", label: "✅ ANSWERED" },
  abstained: { cls: "abstain", label: "⏸ ABSTAINED" },
  blocked: { cls: "blocked", label: "🚫 BLOCKED" },
  error: { cls: "error", label: "❌ ERROR" },
};

function fmt(ms) {
  if (ms == null) return "–";
  return ms < 10 ? `${ms.toFixed(1)}ms` : `${Math.round(ms)}ms`;
}

/* ── Animated particle background ─────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.o})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particles-canvas" />;
}

/* ── Animated waveform for recording ──────────────────────────── */
function Waveform() {
  const [bars] = useState(() => Array.from({ length: 20 }, () => Math.random() * 0.7 + 0.3));
  return (
    <div className="waveform">
      {bars.map((h, i) => (
        <div key={i} className="wave-bar" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
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
  const [showResult, setShowResult] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
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
    setError(""); setResult(null); setShowResult(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setBusy(true);
        voice(blob, hint.trim())
          .then((r) => { setResult(r); setShowResult(true); })
          .catch((e) => setError(e.message))
          .finally(() => setBusy(false));
      };
      rec.start(); setRecording(true); setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (e) { setError(`Microphone unavailable: ${e.message}`); }
  };

  const submitText = async (text, demoIdx) => {
    if (!text.trim() || busy) return;
    setError(""); setResult(null); setShowResult(false); setBusy(true);
    setActiveDemo(demoIdx);
    try {
      const res = await query(text.trim());
      setResult(res); setShowResult(true);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const meta = result ? STATUS_META[result.status] || STATUS_META.error : null;
  const timings = result?.timings || {};
  const maxStage = Math.max(1, ...Object.keys(STAGE_LABELS).map((k) => timings[k] || 0));

  return (
    <div className="app">
      <Particles />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="brand">
          <div className="logo-wrap"><span className="logo">◉</span></div>
          <div>
            <h1>Voice RAG</h1>
            <p>HH Goa 2026 · MSMARCO-XI</p>
          </div>
        </div>
        <div className="health">
          <span className={`dot ${health?.status === "ok" ? "up" : "down"}`} />
          <span>{health?.status === "ok" ? "Online" : "Offline"}</span>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-badge">🚀 HH Goa 2026 — Shortlisting Task 2</div>
        <h2 className="hero-title">
          Voice-Enabled <span className="gradient-text">RAG System</span>
        </h2>
        <p className="hero-sub">
          Ask questions in Hindi — spoken or typed — and get grounded answers
          from a 10,000-passage knowledge base.
        </p>
        <div className="hero-stats">
          <div className="stat"><span className="stat-val">85ms</span><span className="stat-label">P50</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">4</span><span className="stat-label">Strategies</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">62</span><span className="stat-label">Tests</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">100%</span><span className="stat-label">Guarded</span></div>
        </div>
        <button className="hero-cta" onClick={() => document.getElementById("console")?.scrollIntoView({ behavior: "smooth" })}>
          Try It Now ↓
        </button>
      </section>

      {/* ── Features Grid ── */}
      <section className="features-grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-card" style={{ "--fc": f.color }}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── Console Section ── */}
      <section className="console-section" id="console">
        <div className="section-header">
          <h2>Try It Now</h2>
          <p>Speak or type a question in Hindi</p>
        </div>

        <div className="console-grid">
          {/* Input Panel */}
          <div className="input-panel glass-card">
            <div className="input-panel-header">
              <div className="panel-dot green" />
              <span>Query Input</span>
            </div>

            <div className="mic-row">
              <button
                className={`mic ${recording ? "recording" : ""} ${busy ? "busy" : ""}`}
                onClick={recording ? stopRecording : startRecording}
                disabled={busy}
              >
                <div className="mic-inner">{recording ? "■" : "🎤"}</div>
                {recording && <div className="mic-ring" />}
              </button>
              <div className="mic-state">
                {recording ? (
                  <span className="rec-label">
                    <span className="rec-dot" /> RECORDING {recSeconds}s
                  </span>
                ) : busy ? (
                  <span className="busy-label">
                    <span className="busy-dot" /> Processing…
                  </span>
                ) : (
                  <span className="idle-label">Click mic or type below</span>
                )}
              </div>
              {recording && <Waveform />}
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
                <span>Ask</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>

            <label className="hint-row">
              <input className="hint-input" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="(dev) mock-STT override" />
            </label>

            <div className="samples">
              <div className="samples-label">Quick demos:</div>
              {SAMPLES.map((s, i) => (
                <button
                  key={s.label}
                  className={`sample ${s.color} ${activeDemo === i ? "active" : ""}`}
                  onClick={() => submitText(s.text, i)}
                  disabled={busy}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}
          </div>

          {/* Result Panel */}
          {showResult && result && (
            <div className="result-panel glass-card">
              <div className="result-head">
                <span className={`status ${meta.cls}`}>{meta.label}</span>
                <span className="reqid">#{result.request_id}</span>
              </div>

              {result.query_info && (
                <div className="block">
                  <h3>🧠 QUERY ANALYSIS</h3>
                  <div className="badges">
                    <span className="badge accent">{result.query_info.query_type}</span>
                    <span className="badge dim">{result.query_info.chunk_strategy} view</span>
                    <span className="badge dim">{result.query_info.retrieval_mode}</span>
                  </div>
                </div>
              )}

              {result.status === "ok" && result.answer ? (
                <>
                  <div className="block answer-block">
                    <h3>💬 ANSWER</h3>
                    <p className="answer-text">{result.answer.text}</p>
                    <div className="answer-meta">
                      <span className={`badge ${result.answer.grounded ? "grounded" : "ungrounded"}`}>
                        {result.answer.grounded ? "✅ Grounded" : "⚠️ Ungrounded"}
                      </span>
                      <span className="conf">{(result.answer.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>

                  {result.answer.sources?.length > 0 && (
                    <div className="block">
                      <h3>📚 SOURCES</h3>
                      <div className="source-chips">
                        {result.answer.sources.map((s, i) => (
                          <span key={i} className="source-chip">
                            <span className="source-icon">📄</span>
                            {s.document_id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.grounding && (
                    <div className="block">
                      <h3>🔍 GROUNDING</h3>
                      <div className="grounding-bar-wrap">
                        <div className="grounding-bar">
                          <div className="grounding-fill" style={{ width: `${result.grounding.score * 100}%` }} />
                        </div>
                        <span className="grounding-val">{result.grounding.score.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="block">
                  <h3>🔒 SYSTEM RESPONSE</h3>
                  <div className={`response-badge ${result.status}`}>
                    {result.status === "blocked" && "🚫 Request blocked by guardrails"}
                    {result.status === "abstained" && "⏸ Abstained — no reliable answer"}
                    {result.status === "error" && "❌ Pipeline error — please retry"}
                  </div>
                  {result.status_message && <p className="reason">{result.status_message}</p>}
                </div>
              )}

              {result.retrieval && (
                <div className="block">
                  <h3>🔍 RETRIEVAL</h3>
                  <div className="retrieval-info">
                    <span className="retrieval-badge">{result.retrieval.view}</span>
                    <span>{result.retrieval.num_chunks} chunks</span>
                    <span className="retrieval-conf">conf: {result.retrieval.confidence.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="block latency-block">
                <h3>⏱️ LATENCY</h3>
                <div className="latency">
                  {Object.keys(STAGE_LABELS)
                    .filter((k) => timings[k] != null)
                    .map((k) => (
                      <div key={k} className="lat-row">
                        <span className="lat-name">{STAGE_LABELS[k]}</span>
                        <div className="lat-track">
                          <div className="lat-bar" style={{ width: `${Math.max(3, (timings[k] / maxStage) * 100)}%` }} />
                        </div>
                        <span className="lat-val">{fmt(timings[k])}</span>
                      </div>
                    ))}
                  <div className="lat-row total">
                    <span className="lat-name">TOTAL</span>
                    <div className="lat-track"><div className="lat-bar total" style={{ width: "100%" }} /></div>
                    <span className="lat-val">{fmt(result.total_ms)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-sm">◉</span>
            <span>Voice RAG Console</span>
          </div>
          <div className="footer-links">
            <a href="/docs" target="_blank" rel="noreferrer">API Docs</a>
            <a href="https://github.com/shrutirai29/GOA" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <div className="footer-tag">#RAGInGoa</div>
        </div>
      </footer>
    </div>
  );
}
