"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const LANDSCAPE = [
  {
    src: "/vibe/hero.jpg",
    label: "THE PALMS",
    alt: "Palm trees against a dark green HH Goa background, with white trunks and green fronds",
    w: 2864,
    h: 1456,
  },
  {
    src: "/vibe/event.jpg",
    label: "THE COWORKING",
    alt: "Builders at laptops around a long wooden table in front of the HH Goa coworking house",
    w: 2858,
    h: 1454,
  },
];

const PORTRAIT = [
  {
    src: "/vibe/card.jpg",
    label: "THE CARD",
    alt: "The HH Goa 2026 builder ID poster with a photo placeholder and green gradient",
    w: 882,
    h: 1170,
  },
];

function Frame({
  children,
  label,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <motion.figure
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-[#0e2418] p-2.5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)]"
      >
        {children}
        <figcaption className="mt-2.5 flex items-center justify-between px-1.5 pb-1">
          <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-mist transition-colors group-hover:text-electric">
            {label}
          </span>
          <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-mist/80">HH GOA 2026</span>
        </figcaption>
      </motion.figure>
    </Reveal>
  );
}

export function VibeGallery() {
  return (
    <section id="vibe" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.34em] text-electric">THE VIBE</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] uppercase leading-[0.95]">
          This is <span className="text-gradient-brand">the energy.</span>
        </h2>
        <p className="mt-4 max-w-lg font-mono text-[12px] font-medium tracking-[0.08em] text-mist">
          SUN. JUNGLE. NEON GREEN. GOLD DUST. THE CARDS CARRY THE SAME VIBE.
        </p>
      </Reveal>

      {/* landscape row */}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {LANDSCAPE.map((img, i) => (
          <Frame key={img.src} label={img.label} delay={i * 0.1}>
            <div className="relative aspect-[2/1] overflow-hidden rounded-xl">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          </Frame>
        ))}
      </div>

      {/* portrait row — the card, centered */}
      <div className="mt-5 grid grid-cols-1">
        {PORTRAIT.map((img, i) => (
          <Frame key={img.src} label={img.label} delay={i * 0.1} className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
          </Frame>
        ))}
      </div>
    </section>
  );
}
