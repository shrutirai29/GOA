"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FORMATS, THEMES, type FormatId, type StyleId } from "@/lib/cardStyles";
import { CardRenderer, type CardRendererProps } from "./CardRenderer";

const PHASES = [
  "CALIBRATING IDENTITY...",
  "LOCKING FRAME...",
  "INJECTING NEON...",
  "IDENTITY GENERATED",
];

interface CardPreviewProps extends CardRendererProps {
  generating: boolean;
  generated: boolean;
  format: FormatId;
  style: StyleId;
  /** Ref attached to the underlying 540px card node for PNG export. */
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

export function CardPreview({
  generating,
  generated,
  format,
  style,
  exportRef,
  ...cardProps
}: CardPreviewProps) {
  const reduce = useReducedMotion();
  const dims = FORMATS[format];
  const theme = THEMES[style];

  const outerRef = useRef<HTMLDivElement>(null);
  const internalCardRef = useRef<HTMLDivElement>(null);
  const cardRef = exportRef ?? internalCardRef;

  const [scale, setScale] = useState(1);
  const [phase, setPhase] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /* scale the 540px card to fit the container width */
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / dims.w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w]);

  /* generation phase sequence */
  useEffect(() => {
    if (!generating) return;
    const reset = requestAnimationFrame(() => setPhase(0));
    const timers = PHASES.map((_, i) =>
      window.setTimeout(() => setPhase(i), i * 300),
    );
    return () => {
      cancelAnimationFrame(reset);
      timers.forEach(clearTimeout);
    };
  }, [generating]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || generating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -7, y: nx * 9 });
  };

  const onPointerLeave = () => setTilt({ x: 0, y: 0 });

  const idle = reduce
    ? {}
    : { rotateY: [0, 1.1, 0, -1, 0], rotateX: [0, -0.7, 0, 0.7, 0], y: [0, -4, 0, -3, 0] };

  return (
    <div className="relative">
      {/* glow behind card */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: theme.glow, opacity: 0.16 }}
      />

      <div
        ref={outerRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative"
        style={{
          width: "100%",
          maxWidth: 470,
          margin: "0 auto",
          perspective: 1300,
          touchAction: "pan-y",
        }}
      >
        {/* layout placeholder keeps height while the card is absolutely scaled */}
        <div style={{ width: "100%", aspectRatio: `${dims.w} / ${dims.h}` }} />

        {/* wrapper box is the *scaled* size, so the card's layout never
            overflows the container (transform scale keeps layout at 540px) */}
        <div
          className="absolute top-0"
          style={{
            left: "50%",
            marginLeft: -(dims.w * scale) / 2,
            width: dims.w * scale,
            height: dims.h * scale,
            transformStyle: "preserve-3d",
          }}
        >
        <motion.div
          style={{
            width: dims.w,
            height: dims.h,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {/* mouse tilt */}
          <motion.div
            style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
            animate={generating || reduce ? { rotateX: 0, rotateY: 0 } : { rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 160, damping: 18, mass: 0.6 }}
          >
            {/* idle float */}
            <motion.div
              className="h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={generating || reduce ? {} : idle}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* generation pulse */}
              <motion.div
                className="relative h-full w-full"
                animate={generating ? { scale: 0.94, rotateX: -3, rotateZ: -1.2 } : { scale: 1, rotateX: 0, rotateZ: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* card-glow shadow wrapper (preview only, not exported) */}
                <div className="card-glow" style={{ width: "100%", height: "100%", ["--glow-color" as string]: theme.glow }}>
                  <CardRenderer ref={cardRef} format={format} style={style} {...cardProps} />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>

        {/* generation overlay */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-20 overflow-hidden rounded-2xl"
              style={{
                background: "rgba(4,3,10,0.82)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* scan sweep */}
              <motion.div
                aria-hidden
                className="absolute left-0 right-0"
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 1.05, ease: "easeInOut" }}
                style={{
                  height: "26%",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.28) 45%, rgba(245,197,66,0.4) 50%, rgba(52,211,153,0.28) 55%, transparent 100%)",
                }}
              />
              {/* corner brackets */}
              <div aria-hidden className="absolute inset-6" style={{ pointerEvents: "none" }}>
                {[
                  "border-l-2 border-t-2 rounded-tl-xl",
                  "border-r-2 border-t-2 rounded-tr-xl",
                  "border-l-2 border-b-2 rounded-bl-xl",
                  "border-r-2 border-b-2 rounded-br-xl",
                ].map((c, i) => (
                  <span key={i} className={`absolute h-8 w-8 ${c} ${i < 2 ? "top-0" : "bottom-0"} ${i % 2 === 0 ? "left-0" : "right-0"} border-electric`} />
                ))}
              </div>

              <div className="relative z-10 px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phase}
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                    transition={{ duration: 0.28 }}
                    className="font-mono text-sm font-bold tracking-[0.28em]"
                    style={{ color: phase === PHASES.length - 1 ? "#34d399" : "#e9f6ee" }}
                  >
                    {PHASES[phase]}
                  </motion.p>
                </AnimatePresence>
                {phase < PHASES.length - 1 && (
                  <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-electric to-neon"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* generated badge */}
      <AnimatePresence>
        {generated && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-5 flex justify-center"
          >
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.24em] text-tropic">
              <span className="h-1.5 w-1.5 rounded-full bg-tropic shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              IDENTITY GENERATED
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
