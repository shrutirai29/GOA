"use client";

import { useReducedMotion } from "framer-motion";

const ITEMS = [
  "SUN + SAND + CODE",
  "FRAME IN GOA",
  "SHIP IT",
  "COCONUTS & COMMITS",
  "PALM TREES & PUSHES",
  "SEE YOU IN GOA",
];

export function Marquee() {
  const reduce = useReducedMotion();
  const row = [...ITEMS, ...ITEMS];

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-white/[0.08] py-5"
      style={reduce ? { overflowX: "auto" } : undefined}
    >
      <div className="marquee-track">
        {row.map((item, i) => (
          <span
            key={i}
            className="mx-7 flex shrink-0 items-center gap-14 font-display text-2xl uppercase tracking-[0.12em] text-white/55 sm:text-3xl"
          >
            {item}
            <span className="text-electric/70">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
