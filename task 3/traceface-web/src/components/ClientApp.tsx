"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { HowItWorks } from "@/components/HowItWorks";
import { Pipeline } from "@/components/Pipeline";
import { Footer } from "@/components/Footer";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

export default function ClientApp() {
  return (
    <>
      <NoiseOverlay />
      <Navbar />
      <main className="relative">
        <Hero />
        <Marquee />
        <Pipeline />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
