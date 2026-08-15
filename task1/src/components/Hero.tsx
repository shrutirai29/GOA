"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, Zap, Sparkles, ArrowUpRight } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LeafCluster, Sun } from "@/components/ui/Plant";

const FLOATING_CHIPS = [
  { label: "BUILDER ID", className: "left-[8%] top-[30%] hidden lg:block", delay: 0 },
  { label: "GOA · 2026", className: "left-[12%] bottom-[30%] hidden lg:block", delay: 1.8 },
];

const POSTERS = [
  {
    src: "/vibe/card.jpg",
    alt: "The HH Goa 2026 builder ID card — deep green with a circular photo and gold accents",
    label: "BUILDER ID 001",
    w: 205,
    h: 272,
    rotate: 6,
    delay: 0.9,
    depth: 1,
    className: "right-[4%] top-[19%]",
  },
  {
    src: "/vibe/feed.jpg",
    alt: "HH Goa Hacker House poster with palm trees and Devanagari lettering",
    label: "HACKER HOUSE",
    w: 150,
    h: 278,
    rotate: -7,
    delay: 1.5,
    depth: -1,
    className: "right-[15%] bottom-[13%]",
  },
];

export function Hero() {
  const reduce = useReducedMotion();

  // Gentle mouse parallax for the floating posters (desktop, fine pointers only)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const pNear = useTransform(sx, (v) => v * 16);
  const pNearY = useTransform(sy, (v) => v * 12);
  const pFar = useTransform(sx, (v) => v * -24);
  const pFarY = useTransform(sy, (v) => v * -18);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      onPointerMove={onPointerMove}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      {/* Real palm greenery from the reference art, creeping up from the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[34vh] opacity-[0.6]"
        style={{
          backgroundImage: "url(/vibe/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 56%",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Golden Goa sun behind the headline */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 1.4, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-[13%] -translate-x-1/2"
        style={{ width: "min(50vw, 400px)", aspectRatio: "1" }}
      >
        <Sun style={{ width: "100%", height: "100%" }} />
      </motion.div>

      {/* Dim the sun glow right behind the headline so the text stays crisp */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(125vw, 880px)",
          height: "min(95vh, 680px)",
          background:
            "radial-gradient(closest-side, rgba(1,7,4,0.92) 0%, rgba(1,7,4,0.72) 45%, rgba(1,7,4,0.42) 66%, rgba(1,7,4,0) 85%)",
        }}
      />

      {/* Bottom scrim so the sub-line and CTAs always sit on dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background: "linear-gradient(to top, rgba(3,15,8,0.92) 0%, rgba(3,15,8,0.65) 45%, rgba(3,15,8,0) 100%)",
        }}
      />

      {/* Foreground jungle — bottom-left cluster */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6vh] left-[-4vw] w-[42vw] opacity-[0.5]"
        style={{ maxWidth: 520 }}
      >
        <LeafCluster color="#1f7a45" accent="#2dd4bf" style={{ width: "100%" }} />
      </div>
      {/* Foreground jungle — small frond top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5vw] top-[8vh] w-[24vw] opacity-[0.4]"
        style={{ maxWidth: 300, transform: "scaleX(-1)" }}
      >
        <LeafCluster color="#17603a" accent="#f5c542" style={{ width: "100%" }} />
      </div>

      {/* Floating chips */}
      {FLOATING_CHIPS.map((chip) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 + chip.delay * 0.15, duration: 0.8 }}
          className={`absolute ${chip.className}`}
          style={reduce ? undefined : { animation: `float 8s ease-in-out ${chip.delay}s infinite` }}
        >
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            {chip.label}
          </div>
        </motion.div>
      ))}

      {/* Floating posters — the actual vibe art, drifting at different depths */}
      {POSTERS.map((p) => {
        const isNear = p.depth === 1;
        return (
          <motion.div
            key={p.src}
            initial={{ opacity: 0, y: 40, rotate: p.rotate }}
            animate={{ opacity: 1, y: 0, rotate: p.rotate }}
            transition={{ delay: p.delay, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-none absolute hidden lg:block ${p.className}`}
            style={{ width: p.w }}
          >
            <motion.div style={{ x: isNear ? pNear : pFar, y: isNear ? pNearY : pFarY }}>
              <motion.div
                style={reduce ? undefined : { animation: `float 9s ease-in-out ${p.delay}s infinite` }}
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/50 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.w}
                    height={p.h}
                    className="rounded-xl"
                    draggable={false}
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] text-bone backdrop-blur-sm">
                    {p.label}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="glass mb-8 flex items-center gap-2.5 rounded-full px-4 py-2"
      >
        <Sparkles size={13} className="text-electric" />
        <span className="font-mono text-[11px] tracking-[0.24em] text-mist">
          HH GOA 2026 · IDENTITY SYSTEM
        </span>
      </motion.div>

      {/* Headline */}
      <h1
        className="text-center font-display uppercase leading-[0.92]"
        style={{ filter: "drop-shadow(0 2px 24px rgba(1,7,4,0.95)) drop-shadow(0 1px 5px rgba(1,7,4,1))" }}
      >
        <span className="block text-[clamp(3.2rem,12vw,9.5rem)]">
          <SplitText text="HH GOA" delay={0.65} className="block" />
        </span>
        <span className="block text-[clamp(3.2rem,12vw,9.5rem)]">
          <SplitText
            text="2026"
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
          BUILD YOUR IDENTITY.
        </motion.span>
      </h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.7 }}
        className="mt-7 max-w-md text-center text-[15px] font-medium leading-relaxed text-bone/90 sm:text-base"
        style={{ filter: "drop-shadow(0 2px 16px rgba(1,7,4,0.95)) drop-shadow(0 1px 4px rgba(1,7,4,1))" }}
      >
        Turn your face into your builder identity. A premium ID card and PFP frame,
        made for the builders heading to Goa.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.7 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <MagneticButton onClick={() => scrollTo("#generator")}>
          <Zap size={15} />
          Create Your ID
        </MagneticButton>
        <a
          href="https://hacker-house-goa-2026.devfolio.co/?ref=5d3bdd58f6"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="view"
          className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f5c542] via-[#ff9a3d] to-[#f59e0b] px-8 py-4 font-mono text-[13px] font-bold tracking-[0.18em] text-[#201303] shadow-[0_12px_40px_-10px_rgba(245,197,66,0.75)] transition-all hover:scale-[1.03] hover:shadow-[0_16px_52px_-10px_rgba(245,197,66,0.95)]"
        >
          <ArrowUpRight size={15} />
          APPLY NOW
        </a>
        <MagneticButton variant="ghost" onClick={() => scrollTo("#how")}>
          How It Works
        </MagneticButton>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollTo("#generator")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 min-[720px]:block"
        aria-label="Scroll to the generator"
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
