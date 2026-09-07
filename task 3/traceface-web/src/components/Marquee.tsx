"use client";

import { Eye, Link, Shield, Search, Fingerprint, Lock, CheckCircle } from "lucide-react";

const ITEMS = [
  { icon: Eye, text: "FACE DETECTION" },
  { icon: Fingerprint, text: "EMBEDDING GENERATION" },
  { icon: Search, text: "REVERSE IMAGE SEARCH" },
  { icon: Link, text: "RESULT MATCHING" },
  { icon: Shield, text: "EVIDENCE HASHING" },
  { icon: Lock, text: "BLOCKCHAIN ANCHORING" },
  { icon: CheckCircle, text: "TAMPER DETECTION" },
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#040e08]/80 py-5">
      {/* Gradient masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#030806] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#030806] to-transparent z-10" />

      <div className="flex w-max animate-marquee">
        {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-8 font-mono text-[12px] tracking-[0.2em] text-mist/70"
          >
            <item.icon size={14} className="text-electric/60" />
            <span>{item.text}</span>
            <span className="ml-4 h-px w-8 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
