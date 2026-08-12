"use client";

import { useEffect, useRef } from "react";

const LABELS: Record<string, string> = {
  view: "VIEW",
  drop: "DROP",
};

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.classList.add("custom-cursor");

    let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    const ringPos = { ...target };
    let hovering = false;
    let label = "";
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest?.(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor]',
      );
      hovering = Boolean(interactive);
      label = LABELS[(interactive as HTMLElement | null)?.dataset?.cursor ?? ""] ?? "";
    };

    const onLeave = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
    };
    const onEnter = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) dot.style.opacity = "1";
      if (ring) ring.style.opacity = "1";
    };

    const tick = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) {
        // refs attach on the next render after mount
        raf = requestAnimationFrame(tick);
        return;
      }
      pos.x += (target.x - pos.x) * 0.5;
      pos.y += (target.y - pos.y) * 0.5;
      ringPos.x += (target.x - ringPos.x) * 0.16;
      ringPos.y += (target.y - ringPos.y) * 0.16;

      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      const ringScale = hovering ? (label ? 3.4 : 1.9) : 1;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      ring.style.borderColor = hovering
        ? "rgba(134,239,172,0.9)"
        : "rgba(52,211,153,0.45)";
      ring.textContent = label;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 9999,
    borderRadius: "50%",
    willChange: "transform",
    opacity: 0,
  };

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        style={{
          ...base,
          width: 7,
          height: 7,
          background: "#fff",
          boxShadow: "0 0 12px rgba(52,211,153,0.9)",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{
          ...base,
          width: 34,
          height: 34,
          border: "1.5px solid rgba(52,211,153,0.45)",
          transition: "border-color 0.2s ease, opacity 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          letterSpacing: "0.18em",
          fontFamily: "var(--font-jetbrains)",
          color: "#fff",
          fontWeight: 600,
          background: "rgba(52,211,153,0.12)",
          backdropFilter: "blur(2px)",
        }}
      />
    </>
  );
}
