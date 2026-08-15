"use client";

import { ImageUp, SlidersHorizontal, Share2 } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    icon: ImageUp,
    title: "DROP YOUR PHOTO",
    body: "Upload from your phone or laptop. HEIC, JPG, PNG, WebP — all handled in your browser.",
  },
  {
    n: "02",
    icon: SlidersHorizontal,
    title: "CUSTOMIZE IT",
    body: "Your name, your stack, your builder title. Drag the photo, zoom, rotate, pick a style.",
  },
  {
    n: "03",
    icon: Share2,
    title: "SHARE TO X",
    body: "Generate a crisp 1080px card, download the PNG, and share it with #FrameInGoa.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative isolate mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        style={{
          background:
            "radial-gradient(65% 100% at 50% 0%, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0) 70%)",
        }}
      />
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.34em] text-electric">THE PROCESS</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] uppercase leading-[0.95]">
          Three moves.
          <br />
          <span className="text-outline">One identity.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.12}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/30 bg-[#0e2418] p-7 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] transition-colors duration-500 hover:border-electric/70 hover:bg-[#123021]">
              {/* giant ghost number — gold, clearly visible */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 font-display text-[7rem] leading-none text-neon/40 transition-colors duration-500 group-hover:text-neon/65"
              >
                {step.n}
              </span>

              <div className="relative">
                <div className="mb-6 inline-grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-electric/30 to-neon/20">
                  <step.icon size={21} className="text-electric" />
                </div>
                <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-electric">STEP {step.n}</p>
                <h3 className="mt-2 font-display text-xl uppercase tracking-wide text-bone">
                  {step.title}
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-mist">{step.body}</p>
              </div>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-electric to-neon transition-all duration-500 group-hover:w-full" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
