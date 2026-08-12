import { Background } from "@/components/Background";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { VibeGallery } from "@/components/VibeGallery";
import { Generator } from "@/components/generator/Generator";
import { HowItWorks } from "@/components/HowItWorks";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Background />
      <Navbar />
      <main className="relative">
        <Hero />
        <Marquee />
        <VibeGallery />
        <Generator />
        <HowItWorks />
        <About />
      </main>
      <Footer />
    </>
  );
}
