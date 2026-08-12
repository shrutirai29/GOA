"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Zap, ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "#generator", label: "CREATE ID" },
  { href: "#how", label: "HOW IT WORKS" },
  { href: "#about", label: "ABOUT" },
];

function scrollToId(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-5 py-3 transition-all duration-500 ${
            scrolled
              ? "border-white/20 bg-[#0b0818]/90 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border-white/15 bg-[#0b0818]/75 shadow-[0_10px_36px_-14px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          }`}
          aria-label="Primary"
        >
          {/* Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2.5"
            aria-label="HH Goa 2026 — back to top"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#22c55e] to-[#2dd4bf] font-mono text-[11px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(52,211,153,0.8)] transition-transform duration-300 group-hover:rotate-6">
              HG
            </span>
            <span className="font-mono text-[13px] font-bold tracking-[0.22em] text-bone">
              HH GOA <span className="text-electric">2026</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollToId(l.href)}
                className="rounded-full px-4 py-2 font-mono text-[12px] tracking-[0.14em] text-mist transition-colors hover:text-bone"
              >
                {l.label}
              </button>
            ))}
            <a
              href="https://hhgoa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 font-mono text-[12px] font-bold tracking-[0.14em] text-electric transition-colors hover:text-bone"
            >
              APPLY ↗
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToId("#generator")}
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#2dd4bf] px-5 py-2.5 font-mono text-[12px] font-bold tracking-[0.12em] text-white shadow-[0_6px_20px_-6px_rgba(52,211,153,0.8)] transition-all hover:shadow-[0_8px_28px_-6px_rgba(52,211,153,1)] sm:inline-flex"
            >
              <Zap size={14} />
              CREATE YOUR ID
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-bone md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-[#05040a]/90 backdrop-blur-xl md:hidden"
          >
            <div className="px-6 pb-10 pt-24">
              <div className="flex flex-col gap-2">
                {LINKS.map((l, i) => (
                  <motion.button
                    key={l.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.4 }}
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => scrollToId(l.href), 60);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-left font-display text-3xl uppercase tracking-wide text-bone"
                  >
                    {l.label}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18, duration: 0.4 }}
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => scrollToId("#generator"), 60);
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#2dd4bf] px-6 py-5 font-mono text-sm font-bold tracking-[0.14em] text-white"
                >
                  <Zap size={16} /> CREATE YOUR ID
                </motion.button>
                <motion.a
                  href="https://hhgoa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.26, duration: 0.4 }}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-neon/50 bg-neon/10 px-6 py-5 font-mono text-sm font-bold tracking-[0.14em] text-neon"
                >
                  APPLY NOW <ArrowUpRight size={16} />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
