"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

interface Spark {
  id: number;
  x: number;
  y: number;
}

interface ClickSparkProps {
  children: ReactNode;
  className?: string;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
}

const SPARKS = 10;

/** Renders a small radial spark burst wherever the wrapped element is clicked. */
export function ClickSpark({
  children,
  className,
  sparkColor = "#c4a9ff",
  sparkSize = 3,
  sparkRadius = 26,
}: ClickSparkProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = idRef.current++;
      setSparks((s) => [...s, { id, x, y }]);
      window.setTimeout(() => {
        setSparks((s) => s.filter((sp) => sp.id !== id));
      }, 650);
    },
    [],
  );

  return (
    <span ref={wrapRef} className={`relative inline-block ${className ?? ""}`} onClick={handleClick}>
      {children}
      {sparks.map((sp) => (
        <span key={sp.id} className="pointer-events-none absolute left-0 top-0" style={{ transform: `translate(${sp.x}px, ${sp.y}px)` }}>
          {Array.from({ length: SPARKS }).map((_, i) => {
            const angle = (i / SPARKS) * Math.PI * 2;
            return (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  width: sparkSize,
                  height: sparkSize,
                  background: sparkColor,
                  animation: "sparkFly 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                  ["--spark-x" as string]: `${Math.cos(angle) * sparkRadius}px`,
                  ["--spark-y" as string]: `${Math.sin(angle) * sparkRadius}px`,
                }}
              />
            );
          })}
        </span>
      ))}
    </span>
  );
}
