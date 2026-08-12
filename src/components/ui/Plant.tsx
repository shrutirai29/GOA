import type { CSSProperties } from "react";

/* ---------- Single banana-leaf silhouette ---------- */

interface LeafProps {
  color?: string;
  className?: string;
  style?: CSSProperties;
  opacity?: number;
  flip?: boolean;
}

export function Leaf({ color = "#1f7a45", className, style, opacity = 1, flip = false }: LeafProps) {
  return (
    <svg
      viewBox="0 0 100 180"
      className={className}
      style={{ display: "block", ...(flip ? { transform: "scaleX(-1)" } : {}), ...style }}
      aria-hidden
    >
      <path
        d="M50 6 C 27 55, 21 122, 50 174 C 79 122, 73 55, 50 6 Z"
        fill={color}
        opacity={opacity}
      />
      <path
        d="M50 14 C 43 70, 43 128, 50 166"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        fill="none"
        opacity={0.55}
      />
    </svg>
  );
}

/* ---------- A small plant cluster of 3 leaves ---------- */

interface ClusterProps {
  color?: string;
  className?: string;
  style?: CSSProperties;
  opacity?: number;
  accent?: string;
}

export function LeafCluster({ color = "#1f7a45", accent = "#2dd4bf", className, style, opacity = 1 }: ClusterProps) {
  return (
    <div
      className={className}
      style={{ position: "relative", aspectRatio: "120 / 160", pointerEvents: "none", ...style }}
      aria-hidden
    >
      <Leaf
        color={accent}
        opacity={opacity * 0.85}
        style={{ position: "absolute", left: "38%", top: "12%", width: "42%", transform: "rotate(18deg)" }}
      />
      <Leaf
        color={color}
        opacity={opacity}
        style={{ position: "absolute", left: "4%", top: "20%", width: "50%", transform: "rotate(38deg) scaleX(-1)" }}
      />
      <Leaf
        color={color}
        opacity={opacity * 0.95}
        style={{ position: "absolute", left: "49%", top: "32%", width: "48%", transform: "rotate(-14deg)" }}
      />
    </div>
  );
}

/* ---------- Golden sun with soft glow ---------- */

interface SunProps {
  className?: string;
  style?: CSSProperties;
  core?: string;
  glow?: string;
  ring?: boolean;
}

export function Sun({ className, style, core = "#ffd76a", glow = "rgba(245,197,66,0.55)", ring = true }: SunProps) {
  return (
    <div className={className} style={{ position: "relative", ...style }} aria-hidden>
      <div
        style={{
          position: "absolute",
          inset: -40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 34%, #fff3c4 0%, ${core} 42%, #f0a83b 78%, #e08a1e 100%)`,
          boxShadow: `0 0 60px 12px ${glow}`,
        }}
      />
      {ring && (
        <div
          style={{
            position: "absolute",
            inset: "14%",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.55)",
            opacity: 0.85,
          }}
        />
      )}
    </div>
  );
}

/* ---------- Beach wave strokes ---------- */

interface WavesProps {
  className?: string;
  style?: CSSProperties;
  color?: string;
  color2?: string;
}

export function Waves({ className, style, color = "#2dd4bf", color2 = "#f5c542" }: WavesProps) {
  return (
    <svg viewBox="0 0 540 40" className={className} style={{ display: "block", ...style }} aria-hidden>
      <path
        d="M0 22 Q 22.5 12, 45 22 T 90 22 T 135 22 T 180 22 T 225 22 T 270 22 T 315 22 T 360 22 T 405 22 T 450 22 T 495 22 T 540 22"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M0 32 Q 22.5 24, 45 32 T 90 32 T 135 32 T 180 32 T 225 32 T 270 32 T 315 32 T 360 32 T 405 32 T 450 32 T 495 32 T 540 32"
        fill="none"
        stroke={color2}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
