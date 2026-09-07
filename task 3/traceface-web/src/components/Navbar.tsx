"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Menu, X } from "lucide-react";

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
    return () => { document.body.style.overflow = ""; };
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
              ? "border-white/20 bg-[#060e0a]/90 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border-white/15 bg-[#060e0a]/75 shadow-[0_10px_36px_-14px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          }`}
        >
          {/* Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2.5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-neon font-mono text-[11px] font-bold text-white shadow-[0_4px_16px_-4px_rgba(52,211,153,0.8)] transition-transform duration-300 group-hover:rotate-6">
              TF
            </span>
            <span className="font-mono text-[13px] font-bold tracking-[0.22em] text-bone">
              TRACE<span className="text-electric">FACE</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#pipeline"
              className="rounded-full px-4 py-2 font-mono text-[12px] tracking-[0.14em] text-mist transition-colors hover:text-bone"
            >
              PIPELINE
            </a>
            <a
              href="#how"
              className="rounded-full px-4 py-2 font-mono text-[12px] tracking-[0.14em] text-mist transition-colors hover:text-bone"
            >
              HOW IT WORKS
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#pipeline"
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-electric to-neon px-5 py-2.5 font-mono text-[12px] font-bold tracking-[0.12em] text-white shadow-[0_6px_20px_-6px_rgba(52,211,153,0.8)] transition-all hover:shadow-[0_8px_28px_-6px_rgba(52,211,153,1)] sm:inline-flex"
            >
              <Search size={14} />
              START INVESTIGATION
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-bone md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 flex flex-col justify-end bg-[#030806]/90 backdrop-blur-xl md:hidden"
        >
          <div className="px-6 pb-10 pt-24">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setOpen(false); setTimeout(() => document.querySelector("#pipeline")?.scrollIntoView({ behavior: "smooth" }), 60); }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-left font-display text-3xl uppercase tracking-wide text-bone"
              >
                INVESTIGATE
              </button>
              <button
                onClick={() => { setOpen(false); setTimeout(() => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" }), 60); }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-left font-display text-3xl uppercase tracking-wide text-bone"
              >
                HOW IT WORKS
              </button>
              <button
                onClick={() => { setOpen(false); setTimeout(() => document.querySelector("#pipeline")?.scrollIntoView({ behavior: "smooth" }), 60); }}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-electric to-neon px-6 py-5 font-mono text-sm font-bold tracking-[0.14em] text-white"
              >
                <Search size={16} /> START INVESTIGATION
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
