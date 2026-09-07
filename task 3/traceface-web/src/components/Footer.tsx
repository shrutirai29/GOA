"use client";

import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08]">
      {/* Disclaimer */}
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/5 px-4 py-2 mb-6">
          <Shield size={12} className="text-electric" />
          <span className="font-mono text-[10px] tracking-[0.16em] text-electric">
            ETHICAL USE NOTICE
          </span>
        </div>
        <p className="text-[13px] font-medium leading-relaxed text-dim max-w-2xl mx-auto">
          The system performs visual similarity matching against publicly returned search results. 
          A visual match should not automatically be treated as proof of a person&apos;s real-world identity.
        </p>
      </div>

      <div className="hairline" />

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-neon font-mono text-[11px] font-bold text-white">
            TF
          </span>
          <span className="font-mono text-[12px] font-bold tracking-[0.22em] text-bone">
            TRACE<span className="text-electric">FACE</span>
          </span>
        </div>

        <p className="font-display text-sm uppercase tracking-[0.2em] text-mist">
          Discover. Verify. Prove.
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => document.querySelector("#pipeline")?.scrollIntoView({ behavior: "smooth" })}
            className="font-mono text-[10.5px] font-medium tracking-[0.2em] text-mist transition-colors hover:text-bone"
          >
            INVESTIGATE
          </button>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.2em] text-mist">
            HH GOA 2026
          </span>
        </div>
      </div>
      <p className="pb-6 text-center font-mono text-[10px] font-medium tracking-[0.2em] text-mist/80">
        TASK 3: FACE IDENTIFICATION & BLOCKCHAIN VERIFICATION • BUILT FOR HH GOA 2026
      </p>
    </footer>
  );
}
