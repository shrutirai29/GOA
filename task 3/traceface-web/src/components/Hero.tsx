"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, Shield, ArrowDown, Zap } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  const reduce = useReducedMotion();

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24">
      {/* Background gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% -10%, #0a1e14 0%, #040e08 45%, #020604 100%)",
        }}
      />

      {/* Aurora blobs */}
      <div
        aria-hidden
        className="absolute -left-[15%] top-[-25%] h-[75vh] w-[75vh] rounded-full opacity-[0.22] blur-[120px]"
        style={{ background: "radial-gradient(circle, #34d399 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="absolute -right-[15%] top-[28%] h-[65vh] w-[65vh] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-[-22%] left-[28%] h-[60vh] w-[60vh] rounded-full opacity-[0.1] blur-[130px]"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 65%)" }}
      />

      {/* Dim behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(125vw, 880px)",
          height: "min(95vh, 680px)",
          background:
            "radial-gradient(closest-side, rgba(3,8,6,0.92) 0%, rgba(3,8,6,0.72) 45%, rgba(3,8,6,0.42) 66%, rgba(3,8,6,0) 85%)",
        }}
      />

      {/* Bottom scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background: "linear-gradient(to top, rgba(3,8,6,0.92) 0%, rgba(3,8,6,0.65) 45%, rgba(3,8,6,0) 100%)",
        }}
      />

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute left-[8%] top-[30%] hidden lg:block"
      >
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-mist">
          <span className="h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          FACE SCAN
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute left-[12%] bottom-[30%] hidden lg:block"
      >
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-mist">
          <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
          BLOCKCHAIN VERIFIED
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute right-[8%] top-[35%] hidden lg:block"
      >
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-mist">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
          CRYPTO EVIDENCE
        </div>
      </motion.div>

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="glass mb-8 flex items-center gap-2.5 rounded-full px-4 py-2"
      >
        <Shield size={13} className="text-electric" />
        <span className="font-mono text-[11px] tracking-[0.24em] text-mist">
          DIGITAL INVESTIGATION PLATFORM
        </span>
      </motion.div>

      {/* Headline */}
      <h1
        className="text-center font-display uppercase leading-[0.92]"
        style={{ filter: "drop-shadow(0 2px 24px rgba(3,8,6,0.95)) drop-shadow(0 1px 5px rgba(3,8,6,1))" }}
      >
        <span className="block text-[clamp(3.2rem,12vw,9.5rem)]">
          <SplitText text="TRACE" delay={0.65} className="block" />
        </span>
        <span className="block text-[clamp(3.2rem,12vw,9.5rem)]">
          <SplitText
            text="FACE"
            delay={1.05}
            className="block text-gradient-brand"
          />
        </span>
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 block text-[clamp(1.5rem,5vw,3.6rem)] font-bold tracking-[0.08em] text-bone"
        >
          DISCOVER. VERIFY. PROVE.
        </motion.span>
      </h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.7 }}
        className="mt-7 max-w-lg text-center text-[15px] font-medium leading-relaxed text-bone/90 sm:text-base"
        style={{ filter: "drop-shadow(0 2px 16px rgba(3,8,6,0.95)) drop-shadow(0 1px 4px rgba(3,8,6,1))" }}
      >
        Upload a face. Search the web. Discover matches. Create cryptographic evidence. 
        Anchor it on the blockchain. Prove it was never tampered with.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.7 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <MagneticButton onClick={() => scrollTo("#pipeline")}>
          <Search size={15} />
          START INVESTIGATION
        </MagneticButton>
        <MagneticButton variant="ghost" onClick={() => scrollTo("#how")}>
          How It Works
        </MagneticButton>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollTo("#pipeline")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 min-[720px]:block"
      >
        <div className="flex flex-col items-center gap-2 text-dim transition-colors hover:text-bone">
          <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>
          <motion.span
            animate={reduce ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.span>
        </div>
      </motion.button>
    </section>
  );
}
