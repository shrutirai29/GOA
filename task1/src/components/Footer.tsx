"use client";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#22c55e] to-[#2dd4bf] font-mono text-[11px] font-bold text-white">
            HG
          </span>
          <span className="font-mono text-[12px] font-bold tracking-[0.22em] text-bone">
            HH GOA <span className="text-electric">2026</span>
          </span>
        </div>

        <p className="font-display text-sm uppercase tracking-[0.2em] text-mist">
          Built for builders.
        </p>

        <div className="flex items-center gap-6">
          <button
            onClick={() => document.querySelector("#generator")?.scrollIntoView({ behavior: "smooth" })}
            className="font-mono text-[10.5px] font-medium tracking-[0.2em] text-mist transition-colors hover:text-bone"
          >
            CREATE ID
          </button>
          <a
            href="https://hacker-house-goa-2026.devfolio.co/?ref=5d3bdd58f6"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-electric transition-colors hover:text-bone"
          >
            APPLY ↗
          </a>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.2em] text-mist">#FRAMEINGOA</span>
        </div>
      </div>
      <p className="pb-6 text-center font-mono text-[10px] font-medium tracking-[0.2em] text-mist/80">
        GOA · 15.2993° N, 74.1240° E · NO ACCOUNT REQUIRED · PROCESSED IN YOUR BROWSER
      </p>
    </footer>
  );
}
