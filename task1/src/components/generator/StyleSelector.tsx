"use client";

import { STYLE_ORDER, THEMES, type FormatId, type StyleId } from "@/lib/cardStyles";

interface StyleSelectorProps {
  style: StyleId;
  onStyle: (s: StyleId) => void;
}

export function StyleSelector({ style, onStyle }: StyleSelectorProps) {
  return (
    <div className="rounded-3xl border border-white/30 bg-[#0e2418] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <p className="mb-4 font-mono text-[11px] font-bold tracking-[0.22em] text-electric">CARD STYLE</p>
      <div className="grid grid-cols-3 gap-3">
        {STYLE_ORDER.map((id) => {
          const t = THEMES[id];
          const active = style === id;
          return (
            <button
              key={id}
              onClick={() => onStyle(id)}
              aria-pressed={active}
              className={`group relative overflow-hidden rounded-2xl border p-2 text-left transition-all duration-300 ${
                active
                  ? "border-electric bg-electric/15 shadow-[0_0_24px_-6px_rgba(52,211,153,0.6)]"
                  : "border-white/30 bg-white/[0.12] hover:border-white/50"
              }`}
            >
              <div
                className="relative mb-2.5 h-16 w-full overflow-hidden rounded-xl"
                style={{ background: t.swatch }}
              >
                {/* mini card silhouette */}
                <div className="absolute left-1/2 top-1/2 h-10 w-7 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border border-white/25 bg-white/5" />
                <span
                  className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
                />
              </div>
              <p className={`font-mono text-[10px] font-bold tracking-[0.16em] ${active ? "text-electric" : "text-mist"}`}>
                {t.index} · {t.label}
              </p>
              <p className="mt-0.5 font-mono text-[8.5px] tracking-[0.1em] text-dim">{t.tagline}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FormatToggleProps {
  format: FormatId;
  onFormat: (f: FormatId) => void;
}

export function FormatToggle({ format, onFormat }: FormatToggleProps) {
  return (
    <div className="flex rounded-2xl border border-white/30 bg-[#0e2418] p-1.5">
      {(["id", "pfp"] as FormatId[]).map((f) => (
        <button
          key={f}
          onClick={() => onFormat(f)}
          aria-pressed={format === f}
          className={`flex-1 rounded-xl px-4 py-3 font-mono text-[12px] font-bold tracking-[0.16em] transition-all duration-300 ${
            format === f
              ? "bg-gradient-to-r from-electric to-[#2dd4bf] text-white shadow-[0_6px_18px_-6px_rgba(52,211,153,0.8)]"
              : "text-mist hover:text-bone"
          }`}
        >
          {f === "id" ? "BUILDER ID" : "PFP FRAME"}
        </button>
      ))}
    </div>
  );
}
