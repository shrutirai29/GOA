"use client";

import Image from "next/image";
import { MapPin, CalendarDays, Hash, ArrowUpRight } from "lucide-react";
import { BlurText } from "@/components/ui/BlurText";
import { Reveal } from "@/components/ui/Reveal";

const FACTS = [
  { icon: MapPin, label: "WHERE", value: "GOA, INDIA" },
  { icon: CalendarDays, label: "WHEN", value: "2026 · TBD" },
  { icon: Hash, label: "HASHTAG", value: "#FRAMEINGOA" },
];

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.34em] text-electric">ABOUT THE EVENT</p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] uppercase leading-[0.95]">
              Built for
              <br />
              <span className="text-gradient-brand">builders.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-mist">
              HH Goa is where builders, hackers and creative technologists collide. Before you get
              there, claim your seat in the crowd — literally. This generator turns your face into
              your event identity, so the whole timeline knows who&apos;s landing in Goa.
            </p>
            <p className="mt-4 max-w-lg font-mono text-[12px] font-medium leading-relaxed tracking-[0.06em] text-mist">
              FRAME THE PHOTO. LOCK THE IDENTITY. SHIP IT TO X. SEE YOU IN GOA.
            </p>
            <a
              href="https://hhgoa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f5c542] via-[#ff9a3d] to-[#f59e0b] px-8 py-4 font-mono text-[12px] font-bold tracking-[0.18em] text-[#201303] shadow-[0_12px_40px_-10px_rgba(245,197,66,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_16px_52px_-10px_rgba(245,197,66,0.85)]"
            >
              APPLY FOR HH GOA 2026
              <ArrowUpRight size={16} />
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-[#0e2418] p-2">
              <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
                <Image
                  src="/vibe/event.jpg"
                  alt="Builders on laptops at the HH Goa coworking table, surrounded by palms and bougainvillea"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-mist transition-colors group-hover:text-electric">
                  THE COWORKING
                </span>
                <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-mist/80">GOA · 2026</span>
              </div>
            </div>
            <div className="glass rounded-3xl p-8">
            <p className="mb-6 font-mono text-[11px] font-bold tracking-[0.3em] text-electric">EVENT FILE</p>
            <div className="space-y-5">
              {FACTS.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between border-b border-white/[0.08] pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <f.icon size={16} className="text-electric" />
                    <span className="font-mono text-[11px] font-bold tracking-[0.24em] text-mist">{f.label}</span>
                  </div>
                  <span className="font-display text-lg uppercase tracking-wider text-bone">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <BlurText
                text="Turn your face into your builder identity."
                className="font-display text-2xl uppercase leading-snug tracking-wide text-bone/90"
              />
            </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
