import React, { useCallback, useEffect, useRef, useState } from "react";
import { config as fetchConfig, health as fetchHealth, query, voice } from "./api.js";

/* ── Constants ──────────────────────────────────────────────────── */
const SITE_URL = window.location.origin;
const LAST_UPDATED = "2026-08-22";

const SAMPLES = [
  { label: "🎤 Voice Query", text: "स्टबहब टोल फ्री नंबर", color: "cyan", emoji: "🎤" },
  { label: "🔍 Entity", text: "फ्रैंक गिफोर्ड ने कितनी महिलाओं से शादी की", color: "green", emoji: "🔍" },
  { label: "👋 Greeting", text: "नमस्ते", color: "amber", emoji: "👋" },
  { label: "⚠️ Unsafe", text: "बम कैसे बनाएं", color: "red", emoji: "⚠️" },
  { label: "🇧🇩 Bengali", text: "নিগমের সংজ্ঞা কী?", color: "cyan", emoji: "🇧🇩" },
  { label: "🇮🇳 Gujarati", text: "ગુજરાતી ભાષામાં સવાલ", color: "green", emoji: "🇮🇳" },
];

const FEATURES = [
  { icon: "🎯", title: "4 Chunking Strategies", desc: "Fixed, Sentence, Semantic, Hierarchical", color: "#6366f1", tip: "Documents are split using 4 different strategies optimized for different query types. The system routes to the best strategy per query." },
  { icon: "⚡", title: "Sub-200ms Retrieval", desc: "P50 = 19ms hybrid dense + BM25", color: "#06b6d4", tip: "Retrieval uses FAISS (dense vectors) + BM25 (sparse text) with Reciprocal Rank Fusion. P50 = 19ms, well under the 200ms target." },
  { icon: "🛡️", title: "Built-in Guardrails", desc: "Blocks unsafe & injection attempts", color: "#ef4444", tip: "Pre-retrieval checks block unsafe content, prompt injection, and off-topic queries. Post-retrieval grounding verification ensures answers are evidence-based." },
  { icon: "✅", title: "Grounded Answers", desc: "Claims verified against sources", color: "#22c55e", tip: "Every answer is verified against retrieved evidence. If grounding fails, the system retries once and then abstains rather than hallucinate." },
  { icon: "🌐", title: "7 Indian Languages", desc: "Hindi, Bengali, Gujarati & more", color: "#ec4899", tip: "Supports Hindi, Bengali, Gujarati, Marathi, Nepali, Odia, and Assamese. Language is detected via Unicode script analysis in microseconds." },
  { icon: "📊", title: "Full Observability", desc: "Per-stage timing + metrics API", color: "#f59e0b", tip: "Every pipeline stage (router, guardrails, retrieval, rerank, context, generation, grounding) reports its own latency. /api/metrics exposes P50/P70/P100." },
];

const FAQS = [
  { q: "What is a RAG system?", a: "Retrieval-Augmented Generation (RAG) combines a retrieval engine (which finds relevant documents from a knowledge base) with a language model (which generates answers grounded in those documents). This ensures answers are factual and traceable to sources." },
  { q: "How does the voice input work?", a: "Click the microphone button and speak in Hindi or any supported Indian language. The audio is sent to Sarvam AI for speech-to-text conversion, then the transcribed text goes through the RAG pipeline." },
  { q: "Which languages are supported?", a: "The system supports 7 Indian languages: Hindi, Bengali, Gujarati, Marathi, Nepali, Odia, and Assamese. Language is auto-detected from the query text." },
  { q: "What chunking strategies are used?", a: "Four strategies: (1) Fixed-size token chunks with overlap, (2) Sentence-level sliding window, (3) Semantic chunking using embedding similarity, (4) Hierarchical document→section→paragraph structure." },
  { q: "How does the system handle unsafe queries?", a: "Guardrails check for harmful content, prompt injection, and off-topic queries before retrieval. Unsafe requests are blocked immediately with a clear message." },
  { q: "What is grounding verification?", a: "After generating an answer, the system splits it into claims and verifies each claim against the retrieved evidence using both lexical and semantic similarity. If the answer isn't well-supported, the system retries or abstains." },
  { q: "What is the latency target?", a: "The retrieval phase (chunking + vector DB) targets sub-200ms. Measured P50 = 19ms. Full pipeline P50 = ~2.2s including Gemini LLM generation over the network." },
  { q: "How can I test the API directly?", a: "Visit /docs for the interactive Swagger UI. POST to /api/query with {\"query\": \"your question\"} for text queries, or POST to /api/voice with an audio file for voice queries." },
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

/* ── UTM Tracking ──────────────────────────────────────────────── */
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
    const v = params.get(k);
    if (v) utm[k] = v;
  });
  if (Object.keys(utm).length > 0) {
    try { sessionStorage.setItem("utm", JSON.stringify(utm)); } catch (e) {}
  }
  return utm;
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
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.3 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
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

/* ── Scroll Progress Bar ──────────────────────────────────────── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, pct || 0)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

/* ── Scroll to Top Button ─────────────────────────────────────── */
function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return show ? (
    <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top" title="Back to top">
      ↑
    </button>
  ) : null;
}

/* ── Cookie Consent Banner ────────────────────────────────────── */
function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("cookie_consent")) setVisible(true); } catch (e) { setVisible(true); }
  }, []);
  const accept = () => { try { localStorage.setItem("cookie_consent", "accepted"); } catch (e) {} setVisible(false); };
  if (!visible) return null;
  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-content">
        <span className="cookie-icon">🍪</span>
        <p>This site uses essential cookies for functionality and anonymous analytics to improve the experience. No personal data is collected.</p>
        <div className="cookie-actions">
          <button className="cookie-btn accept" onClick={accept}>Accept</button>
          <a href="/tos" className="cookie-btn learn">Learn More</a>
        </div>
      </div>
    </div>
  );
}

/* ── Tooltip ──────────────────────────────────────────────────── */
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="tooltip">{text}</span>}
    </span>
  );
}

/* ── Copy Button ──────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <button className="copy-btn" onClick={copy} title="Copy to clipboard">
      {copied ? "✓" : "📋"}
    </button>
  );
}

/* ── Password Visibility Toggle ───────────────────────────────── */
function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-wrap">
      <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} />
      <button type="button" className="pw-toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? "👁️" : "👁️‍🗨️"}
      </button>
    </div>
  );
}

/* ── Expandable FAQ ───────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-arrow">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="faq-a"><p>{a}</p></div>}
    </div>
  );
}

/* ── Confirmation Modal ───────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── Floating Contact Button ──────────────────────────────────── */
function FloatingContact() {
  const [open, setOpen] = useState(false);
  return (
    <div className="floating-contact">
      {open && (
        <div className="contact-card glass-card">
          <h4>📞 Contact Us</h4>
          <p>Questions about the project?</p>
          <a href="mailto:team@hhgoa2026.com" className="contact-link">📧 Email Team</a>
          <a href="https://github.com/shrutirai29/GOA" target="_blank" rel="noreferrer" className="contact-link">💻 GitHub</a>
          <a href="tel:+919999999999" className="contact-link tap-to-call">📱 Call Us</a>
        </div>
      )}
      <button className={`fab ${open ? "open" : ""}`} onClick={() => setOpen(!open)} aria-label="Contact us">
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

/* ── Search Modal ─────────────────────────────────────────────── */
function SearchModal({ open, onClose }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  if (!open) return null;
  const items = [...FEATURES.map((f) => ({ label: f.title, desc: f.desc, href: "#features" })),
    ...FAQS.map((f) => ({ label: f.q, desc: "FAQ", href: "#faq" })),
    { label: "Try It Now", desc: "Go to the console", href: "#console" },
    { label: "API Documentation", desc: "Interactive Swagger docs", href: "/docs" },
    { label: "GitHub Repository", desc: "Source code", href: "https://github.com/shrutirai29/GOA" },
    { label: "Terms of Service", desc: "Legal terms", href: "/tos" },
  ];
  const filtered = q.trim() ? items.filter((i) => (i.label + " " + i.desc).toLowerCase().includes(q.toLowerCase())) : items;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search features, docs, FAQs…" />
          <kbd className="search-kbd">ESC</kbd>
        </div>
        <div className="search-results">
          {filtered.length === 0 ? (
            <div className="search-empty">No results found</div>
          ) : filtered.map((item, i) => (
            <a key={i} href={item.href} className="search-result" onClick={onClose}>
              <div className="search-result-label">{item.label}</div>
              <div className="search-result-desc">{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Menu ──────────────────────────────────────────────── */
function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-head">
          <span className="logo-sm">◉</span>
          <span>Navigation</span>
          <button className="mobile-menu-close" onClick={onClose}>✕</button>
        </div>
        <a href="#features" onClick={onClose}>Features</a>
        <a href="#console" onClick={onClose}>Console</a>
        <a href="#faq" onClick={onClose}>FAQ</a>
        <a href="/docs" target="_blank" rel="noreferrer" onClick={onClose}>API Docs</a>
        <a href="https://github.com/shrutirai29/GOA" target="_blank" rel="noreferrer" onClick={onClose}>GitHub</a>
        <a href="/tos" onClick={onClose}>Terms of Service</a>
        <div className="mobile-menu-footer">
          <p>HH Goa 2026 · #RAGInGoa</p>
        </div>
      </nav>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────── */
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
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  /* ── Init ── */
  useEffect(() => {
    getUTMParams();
    fetchHealth().then(setHealth).catch(() => setHealth({ status: "offline" }));
    fetchConfig().then(setCfg).catch(() => {});
    try {
      const saved = localStorage.getItem("dark_mode");
      if (saved !== null) setDarkMode(saved === "true");
    } catch (e) {}
    try {
      if (!localStorage.getItem("welcome_shown")) {
        setShowWelcome(true);
        localStorage.setItem("welcome_shown", "true");
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    try { localStorage.setItem("dark_mode", darkMode.toString()); } catch (e) {}
  }, [darkMode]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen((s) => !s); }
      if (e.key === "Escape") { setSearchOpen(false); setMobileMenuOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Recording ── */
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
        setLoadingPhase("stt");
        setBusy(true);
        setLoadingPhase("pipeline");
        voice(blob, hint.trim())
          .then((r) => { setResult(r); setShowResult(true); setLoadingPhase(""); })
          .catch((e) => { setError(e.message); setLoadingPhase(""); })
          .finally(() => { setBusy(false); setLoadingPhase(""); });
      };
      rec.start(); setRecording(true); setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (e) { setError(`Microphone unavailable: ${e.message}`); }
  };

  const submitText = async (text, demoIdx) => {
    if (!text.trim() || busy) return;
    setError(""); setResult(null); setShowResult(false); setBusy(true);
    setActiveDemo(demoIdx);
    setLoadingPhase("router");
    try {
      const phases = ["router", "retrieval", "generation", "grounding"];
      let phaseIdx = 0;
      const phaseTimer = setInterval(() => {
        phaseIdx++;
        if (phaseIdx < phases.length) setLoadingPhase(phases[phaseIdx]);
      }, 400);
      const res = await query(text.trim());
      clearInterval(phaseTimer);
      setResult(res); setShowResult(true); setLoadingPhase("");
    } catch (e) { setError(e.message); setLoadingPhase(""); }
    finally { setBusy(false); setLoadingPhase(""); }
  };

  const meta = result ? STATUS_META[result.status] || STATUS_META.error : null;
  const timings = result?.timings || {};
  const maxStage = Math.max(1, ...Object.keys(STAGE_LABELS).map((k) => timings[k] || 0));

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      {/* Skip to content */}
      <a href="#console" className="skip-link">Skip to main content</a>

      <Particles />
      <ScrollProgress />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <button className="hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <div className="brand">
            <div className="logo-wrap"><span className="logo">◉</span></div>
            <div>
              <h1>Voice RAG</h1>
              <p>HH Goa 2026 · MSMARCO-XI</p>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <button className="search-trigger" onClick={() => setSearchOpen(true)} title="Search (⌘K)">
            🔍 <span className="search-trigger-text">Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode" title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <div className="health">
            <span className={`dot ${health?.status === "ok" ? "up" : "down"}`} />
            <span>{health?.status === "ok" ? "Online" : "Offline"}</span>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(!searchOpen)} />

      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-badge">🚀 HH Goa 2026 — Shortlisting Task 2</div>
        <h2 className="hero-title">
          Voice-Enabled <span className="gradient-text">RAG System</span>
        </h2>
        <p className="hero-sub">
          Ask questions in <strong>7 Indian languages</strong> — spoken or typed — and get
          grounded answers from the MSMARCO-XI knowledge base.
        </p>
        <div className="hero-stats">
          <Tooltip text="Retrieval P50 latency (chunking + vector DB search)">
            <div className="stat"><span className="stat-val">19ms</span><span className="stat-label">P50</span></div>
          </Tooltip>
          <div className="stat-divider" />
          <Tooltip text="Fixed, Sentence, Semantic, Hierarchical chunking">
            <div className="stat"><span className="stat-val">4</span><span className="stat-label">Strategies</span></div>
          </Tooltip>
          <div className="stat-divider" />
          <Tooltip text="Hindi, Bengali, Gujarati, Marathi, Nepali, Odia, Assamese">
            <div className="stat"><span className="stat-val">7</span><span className="stat-label">Languages</span></div>
          </Tooltip>
          <div className="stat-divider" />
          <Tooltip text="Unsafe, injection, off-topic queries blocked">
            <div className="stat"><span className="stat-val">100%</span><span className="stat-label">Guarded</span></div>
          </Tooltip>
        </div>
        <button className="hero-cta" onClick={() => document.getElementById("console")?.scrollIntoView({ behavior: "smooth" })}>
          Try It Now ↓
        </button>
      </section>

      {/* ── Features Grid ── */}
      <section className="features-grid" id="features">
        {FEATURES.map((f, i) => (
          <Tooltip key={i} text={f.tip}>
            <div className="feature-card" style={{ "--fc": f.color, animationDelay: `${0.1 + i * 0.05}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </Tooltip>
        ))}
      </section>

      {/* ── Console Section ── */}
      <section className="console-section" id="console">
        <div className="section-header">
          <h2>Try It Now</h2>
          <p>Speak or type a question in any supported Indian language</p>
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
                  <span className="rec-label"><span className="rec-dot" /> RECORDING {recSeconds}s</span>
                ) : busy ? (
                  <span className="busy-label"><span className="busy-dot" /> Processing… {loadingPhase && `(${loadingPhase})`}</span>
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
                placeholder="Type a Hindi/Bengali/English question…"
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

            {/* Form success/error states */}
            {result?.status === "ok" && (
              <div className="form-success">
                <span>✅ Query processed successfully</span>
              </div>
            )}
            {(result?.status === "blocked" || result?.status === "error") && (
              <div className="form-error">
                <span>❌ {result.status === "blocked" ? "Query blocked by guardrails" : "Pipeline error occurred"}</span>
              </div>
            )}
          </div>

          {/* Result Panel */}
          {showResult && result && (
            <div className="result-panel glass-card">
              <div className="result-head">
                <span className={`status ${meta.cls}`}>{meta.label}</span>
                <span className="reqid">#{result.request_id}</span>
                <CopyButton text={JSON.stringify(result, null, 2)} />
              </div>

              {result.query_info && (
                <div className="block">
                  <h3>🧠 QUERY ANALYSIS</h3>
                  <div className="badges">
                    <Tooltip text={`Query classified as ${result.query_type} type`}>
                      <span className="badge accent">{result.query_info.query_type}</span>
                    </Tooltip>
                    <Tooltip text={`Retrieval uses ${result.query_info.chunk_strategy} chunks`}>
                      <span className="badge dim">{result.query_info.chunk_strategy} view</span>
                    </Tooltip>
                    <span className="badge dim">{result.query_info.retrieval_mode}</span>
                    {result.query_info.language && (
                      <Tooltip text={`Auto-detected: ${result.query_info.language}`}>
                        <span className="badge lang">{result.query_info.language}</span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}

              {result.status === "ok" && result.answer ? (
                <>
                  <div className="block answer-block">
                    <h3>💬 ANSWER</h3>
                    <p className="answer-text">{result.answer.text}</p>
                    <div className="answer-meta">
                      <Tooltip text="Answer is verified against retrieved evidence">
                        <span className={`badge ${result.answer.grounded ? "grounded" : "ungrounded"}`}>
                          {result.answer.grounded ? "✅ Grounded" : "⚠️ Ungrounded"}
                        </span>
                      </Tooltip>
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
                      <Tooltip text="Lexical + semantic overlap between answer claims and evidence">
                        <h3>🔍 GROUNDING</h3>
                      </Tooltip>
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

      {/* ── FAQ Section ── */}
      <section className="faq-section" id="faq">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about the system</p>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="logo-sm">◉</span>
              <span>Voice RAG Console</span>
            </div>
            <div className="footer-links">
              <a href="/docs" target="_blank" rel="noreferrer">API Docs</a>
              <a href="https://github.com/shrutirai29/GOA" target="_blank" rel="noreferrer">GitHub</a>
              <a href="/tos">Terms of Service</a>
              <a href="mailto:shruti.rai2901@gmail.com">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-tag">#RAGInGoa</div>
            <div className="footer-meta">
              Last updated: {LAST_UPDATED} · Built for HH Goa 2026
            </div>
          </div>
        </div>
      </footer>

      <ScrollToTop />
      <CookieConsent />

      {/* Welcome Modal */}
      <Modal open={showWelcome} onClose={() => setShowWelcome(false)} title="Welcome to Voice RAG 🎉">
        <p>This is a voice-enabled RAG system supporting <strong>7 Indian languages</strong>.</p>
        <ul className="welcome-list">
          <li>🎤 Click the microphone to speak</li>
          <li>⌨️ Or type your question below</li>
          <li>🌍 Try Hindi, Bengali, Gujarati, and more</li>
          <li>🛡️ Guardrails block unsafe queries</li>
        </ul>
        <button className="hero-cta" onClick={() => { setShowWelcome(false); document.getElementById("console")?.scrollIntoView({ behavior: "smooth" }); }}>
          Get Started →
        </button>
      </Modal>
    </div>
  );
}
