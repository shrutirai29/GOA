"use client";

import { Eye, Search, FileCode, Link, Shield, CheckCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    icon: Eye,
    title: "UPLOAD & DETECT",
    body: "Upload a face image. Face detection (SSD MobileNet) detects all faces, generates 128-d embeddings, and computes the image fingerprint.",
  },
  {
    n: "02",
    icon: Search,
    title: "SEARCH THE WEB",
    body: "Submit the image to a real reverse image search provider. SerpAPI Google Lens or Bing Visual Search finds public matches.",
  },
  {
    n: "03",
    icon: FileCode,
    title: "HASH EVIDENCE",
    body: "The discovered data is serialized into a canonical JSON package and fingerprinted with SHA-256 — creating a tamper-evident hash.",
  },
  {
    n: "04",
    icon: Link,
    title: "ANCHOR ON-CHAIN",
    body: "The evidence hash is registered on an EVM-compatible blockchain via a Solidity smart contract. Immutable and auditable.",
  },
  {
    n: "05",
    icon: Shield,
    title: "RE-VERIFY",
    body: "Reconstruct the evidence, re-hash it, and compare against the on-chain record. Any tampering produces a different hash.",
  },
  {
    n: "06",
    icon: CheckCircle,
    title: "PROVE INTEGRITY",
    body: "Green means verified. Red means tampered. The blockchain provides an immutable proof of data integrity.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative isolate mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        style={{
          background: "radial-gradient(65% 100% at 50% 0%, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0) 70%)",
        }}
      />

      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.34em] text-electric">THE PIPELINE</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] uppercase leading-[0.95]">
          Six steps.
          <br />
          <span className="text-outline">One proof.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.1}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/30 bg-[#0a1610] p-7 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] transition-colors duration-500 hover:border-electric/70 hover:bg-[#0d1f15]">
              {/* Giant ghost number */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] leading-none text-electric/10 transition-colors duration-500 group-hover:text-electric/25"
              >
                {step.n}
              </span>

              <div className="relative">
                <div className="mb-6 inline-grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-electric/30 to-neon/20">
                  <step.icon size={21} className="text-electric" />
                </div>
                <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-electric">
                  STEP {step.n}
                </p>
                <h3 className="mt-2 font-display text-xl uppercase tracking-wide text-bone">
                  {step.title}
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-mist">
                  {step.body}
                </p>
              </div>

              {/* Bottom glow line */}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-electric to-neon transition-all duration-500 group-hover:w-full" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
