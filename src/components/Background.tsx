"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { LeafCluster } from "@/components/ui/Plant";

const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  loading: () => null,
});

export function Background() {
  const reduced = useReducedMotion() ?? false;

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1 — deep tropical night gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% -10%, #0a2414 0%, #041009 45%, #020804 100%)",
        }}
      />

      {/* Layer 2 — soft aurora */}
      <div
        className="absolute -left-[15%] top-[-25%] h-[75vh] w-[75vh] rounded-full opacity-[0.22] blur-[120px]"
        style={{
          background: "radial-gradient(circle, #34d399 0%, transparent 65%)",
          animation: reduced ? undefined : "pulse 9s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -right-[15%] top-[28%] h-[65vh] w-[65vh] rounded-full opacity-[0.14] blur-[120px]"
        style={{
          background: "radial-gradient(circle, #f5c542 0%, transparent 65%)",
          animation: reduced ? undefined : "pulse 13s ease-in-out infinite alternate-reverse",
        }}
      />
      <div
        className="absolute bottom-[-22%] left-[28%] h-[60vh] w-[60vh] rounded-full opacity-[0.1] blur-[130px]"
        style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 65%)" }}
      />

      {/* Layer 3 — WebGL sun + floating leaves */}
      <Scene reduced={reduced} />

      {/* Layer 4 — real palm greenery from the reference art, creeping up from the bottom */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[46vh] opacity-[0.52]"
        style={{
          backgroundImage: "url(/vibe/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 56%",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* small depth frond, top-right */}
      <div
        aria-hidden
        className="absolute right-[-10vw] top-[16vh] w-[26vw] opacity-[0.1]"
        style={{ maxWidth: 360, transform: "scaleX(-1)" }}
      >
        <LeafCluster color="#17603a" accent="#f5c542" style={{ width: "100%", height: "auto" }} />
      </div>

      {/* Layer 5 — vignette to keep content readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 75% at 50% 42%, transparent 50%, rgba(2,1,6,0.55) 100%)",
        }}
      />
    </div>
  );
}
