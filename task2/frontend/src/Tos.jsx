import React from "react";

export default function TermsOfService() {
  return (
    <div className="app tos-page">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <div className="logo-wrap"><span className="logo">◉</span></div>
            <div>
              <h1>Voice RAG</h1>
              <p>HH Goa 2026 · MSMARCO-XI</p>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <a href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
            ← Back to App
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "2rem" }}>Last updated: August 22, 2026</p>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>1. Acceptance</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            By accessing the Voice RAG Console, you agree to these Terms of Service.
            This system is built for HH Goa 2026 Shortlisting Task 2 demonstration purposes.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>2. Description of Service</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            Voice RAG Console is a Retrieval-Augmented Generation (RAG) system that processes
            voice and text queries in Indian languages (Hindi, Bengali, Gujarati, Marathi, Nepali,
            Odia, Assamese) and returns answers grounded in the AI4Bharat MSMARCO-XI dataset.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>3. Privacy & Data</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            We do not collect, store, or share any personal data. Voice recordings are processed
            in real-time for transcription and are not stored. Anonymous usage analytics may be
            collected to improve the service. API keys are never exposed to the client.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>4. Acceptable Use</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            You agree not to:
          </p>
          <ul style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)", paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
            <li>Use the system for harmful, illegal, or malicious purposes</li>
            <li>Attempt to bypass guardrails or safety mechanisms</li>
            <li>Submit content that violates any applicable law</li>
            <li>Attempt to reverse-engineer or extract the underlying models</li>
            <li>Use automated tools to overwhelm the service</li>
          </ul>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>5. Accuracy Disclaimer</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            While our system uses grounding verification to ensure answer quality,
            all answers should be independently verified. The system may abstain from
            answering when evidence is insufficient — this is intentional and not a bug.
            We do not guarantee 100% accuracy of any generated response.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>6. Intellectual Property</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            The MSMARCO-XI dataset is provided by AI4Bharat under its respective license.
            The system code is available on GitHub under open-source licensing.
            Generated answers are derived from the dataset and should be attributed accordingly.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>7. Limitation of Liability</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            This service is provided "as is" without warranties. We are not liable for any
            decisions made based on the system's outputs. The service may be unavailable
            at times for maintenance or updates.
          </p>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>8. Contact</h2>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-dim)" }}>
            For questions about these terms, contact us via
            <a href="https://github.com/shrutirai29/GOA" style={{ color: "var(--accent)" }}> GitHub</a> or
            <a href="mailto:team@hhgoa2026.com" style={{ color: "var(--accent)" }}> email</a>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-bottom" style={{ border: "none", paddingTop: 0 }}>
            <div className="footer-tag">#RAGInGoa</div>
            <div className="footer-meta">HH Goa 2026 — Voice RAG Console</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
