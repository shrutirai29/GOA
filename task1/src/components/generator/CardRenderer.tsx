"use client";

import { forwardRef } from "react";
import { FORMATS, GOA_COORDS, THEMES, type Crop, type FormatId, type StyleId } from "@/lib/cardStyles";
import { cropToPx, photoTransformCss } from "@/lib/photoTransform";
import { LeafCluster, Waves } from "@/components/ui/Plant";

export interface CardData {
  photo: { dataUrl: string; width: number; height: number } | null;
  crop: Crop;
  name: string;
  stack: string;
  title: string;
  format: FormatId;
  style: StyleId;
}

export interface CardRendererProps extends CardData {
  /** Called with pixel deltas + slot dims while the photo is dragged (live crop). */
  onPhotoDrag?: (dx: number, dy: number, slotW: number, slotH: number) => void;
}

/* ---------- shared pieces ---------- */

function CornerMarks({ theme, size = 16 }: { theme: (typeof THEMES)[StyleId]; size?: number }) {
  const mark = (pos: React.CSSProperties) => (
    <span
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderColor: theme.accent,
        ...pos,
      }}
    />
  );
  return (
    <span aria-hidden style={{ position: "absolute", inset: -6, pointerEvents: "none" }}>
      {mark({ left: 0, top: 0, borderLeft: "2px solid", borderTop: "2px solid" })}
      {mark({ right: 0, top: 0, borderRight: "2px solid", borderTop: "2px solid" })}
      {mark({ left: 0, bottom: 0, borderLeft: "2px solid", borderBottom: "2px solid" })}
      {mark({ right: 0, bottom: 0, borderRight: "2px solid", borderBottom: "2px solid" })}
    </span>
  );
}

/* ---------- real palm art (from the reference images), tinted per style ---------- */

const PALM_CFG: Record<
  StyleId,
  { height: number; pos: string; opacity: number; filter: string; fade: string }
> = {
  tropic: { height: 210, pos: "center 60%", opacity: 0.5, filter: "none", fade: "#0a2214" },
  sunset: {
    height: 220,
    pos: "center 62%",
    opacity: 0.55,
    filter: "sepia(0.55) hue-rotate(-12deg) saturate(1.35) brightness(1.06)",
    fade: "#46220d",
  },
  chrome: {
    height: 210,
    pos: "center 60%",
    opacity: 0.5,
    filter: "grayscale(1) contrast(1.08) brightness(1.14)",
    fade: "#0a0d0b",
  },
};

function PalmStrip({
  style,
  height,
  pos,
}: {
  style: StyleId;
  height?: number;
  pos?: string;
}) {
  const cfg = PALM_CFG[style];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: height ?? cfg.height,
        backgroundImage: "url(/vibe/hero.jpg)",
        backgroundSize: "cover",
        backgroundPosition: pos ?? cfg.pos,
        opacity: cfg.opacity,
        filter: cfg.filter,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, rgba(0,0,0,0) 0%, ${cfg.fade} 92%)`,
        }}
      />
    </div>
  );
}

const FOLIAGE: Record<StyleId, { color: string; accent: string }> = {
  tropic: { color: "#17603a", accent: "#2dd4bf" },
  sunset: { color: "#5c3310", accent: "#ffb45e" },
  chrome: { color: "#33463c", accent: "#cfe3d7" },
};

interface PhotoSlotProps {
  dataUrl: string;
  crop: Crop;
  slotW: number;
  slotH: number;
  theme: (typeof THEMES)[StyleId];
  radius: number;
  ringWidth?: number;
  onPhotoDrag?: CardRendererProps["onPhotoDrag"];
}

function PhotoSlot({ dataUrl, crop, slotW, slotH, theme, radius, ringWidth = 3, onPhotoDrag }: PhotoSlotProps) {
  const px = cropToPx(crop, slotW, slotH);

  const dragHandlers = onPhotoDrag
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          e.stopPropagation();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          const el = e.currentTarget as HTMLElement;
          el.dataset.dragging = "1";
          el.dataset.sx = String(e.clientX);
          el.dataset.sy = String(e.clientY);
          el.style.cursor = "grabbing";
        },
        onPointerMove: (e: React.PointerEvent) => {
          const el = e.currentTarget as HTMLElement;
          if (el.dataset.dragging !== "1") return;
          const dx = e.clientX - Number(el.dataset.sx);
          const dy = e.clientY - Number(el.dataset.sy);
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            onPhotoDrag(dx, dy, slotW, slotH);
            el.dataset.sx = String(e.clientX);
            el.dataset.sy = String(e.clientY);
          }
        },
        onPointerUp: (e: React.PointerEvent) => {
          e.stopPropagation();
          const el = e.currentTarget as HTMLElement;
          el.dataset.dragging = "0";
          el.style.cursor = "";
        },
      }
    : {};

  return (
    <div
      style={{
        position: "relative",
        width: slotW,
        height: slotH,
        borderRadius: radius,
        padding: ringWidth,
        background: theme.photoRing,
        boxShadow: `0 24px 50px -18px rgba(0,0,0,0.6), 0 0 34px -14px ${theme.accent}`,
      }}
      {...dragHandlers}
      role="img"
      aria-label="Your uploaded photo"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - ringWidth,
          overflow: "hidden",
          background: "#0a0716",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the export node must render a plain <img> from a data URL */}
        <img
          src={dataUrl}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...photoTransformCss(px),
            userSelect: "none",
            pointerEvents: "none",
            display: "block",
          }}
        />
      </div>
      <CornerMarks theme={theme} />
    </div>
  );
}

/* ---------- ID card (540 × 675) ---------- */

function IdCard({ photo, crop, name, stack, title, style, onPhotoDrag }: CardRendererProps) {
  const theme = THEMES[style];
  const displayName = name.trim() || "YOUR NAME";
  const displayStack = stack.trim() || "BUILDER STACK";
  const displayTitle = title.trim() || "THE BUILDER";

  return (
    <div
      style={{
        width: 540,
        height: 675,
        background: theme.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: theme.bgAccent }} />

      {/* real palm greenery from the reference art, growing from the bottom */}
      <PalmStrip style={style} />

      {/* ghost GOA */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -34,
          top: 130,
          fontFamily: "var(--font-display)",
          fontSize: 200,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(255,255,255,0.055)",
          whiteSpace: "nowrap",
          transform: "rotate(90deg)",
          letterSpacing: "0.04em",
        }}
      >
        GOA
      </div>

      {/* left accent edge */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, transparent 5%, ${theme.accent} 45%, ${theme.accent2} 70%, transparent 95%)`,
          opacity: 0.85,
        }}
      />

      {/* golden sun peeking from the top-right corner */}
      {(style === "tropic" || style === "sunset") && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -84,
            right: -84,
            width: 190,
            height: 190,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 34%, #fff3c4 0%, #f7c948 42%, #f5a623 72%, #e08a1e 100%)",
            opacity: 0.95,
            boxShadow: "0 0 60px 10px rgba(245,197,66,0.5)",
          }}
        />
      )}

      {/* foliage creeping up from the bottom-left */}
      <div
        aria-hidden
        style={{ position: "absolute", left: 4, bottom: 0, width: 200, opacity: 0.45 }}
      >
        <LeafCluster
          color={FOLIAGE[style].color}
          accent={FOLIAGE[style].accent}
          style={{ width: "100%" }}
        />
      </div>

      {/* beach waves just above the bottom row */}
      <div
        aria-hidden
        style={{ position: "absolute", left: 0, right: 0, bottom: 46, height: 36, opacity: 0.55 }}
      >
        <Waves color={theme.accent2} color2={theme.accent} style={{ width: "100%", height: "100%" }} />
      </div>

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "32px 34px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: theme.ink,
            }}
          >
            HH GOA 2026
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.22em",
              color: theme.dim,
            }}
          >
            BUILDER ID — 001
          </span>
        </div>

        {/* photo — portrait ID-photo shape so faces aren't cropped into a thin strip */}
        <div
          style={{
            flex: 1,
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "14px 0 12px",
          }}
        >
          {photo ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PhotoSlot
                dataUrl={photo.dataUrl}
                crop={crop}
                slotW={322}
                slotH={384}
                theme={theme}
                radius={20}
                onPhotoDrag={onPhotoDrag}
              />
            </div>
          ) : (
            <div
              style={{
                width: 322,
                height: 384,
                margin: "0 auto",
                borderRadius: 20,
                border: "1.5px dashed rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.2em",
                color: theme.dim,
              }}
            >
              YOUR PHOTO HERE
            </div>
          )}
        </div>

        {/* name */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 42,
            lineHeight: 1.02,
            letterSpacing: "0.015em",
            color: theme.ink,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </div>

        {/* stack */}
        <div style={{ marginTop: 9, display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{ width: 26, height: 2, background: theme.accent, display: "block" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.24em",
              color: theme.sub,
              textTransform: "uppercase",
            }}
          >
            {displayStack}
          </span>
        </div>

        {/* builder title */}
        <div
          style={{
            marginTop: 13,
            fontFamily: "var(--font-display)",
            fontSize: 25,
            letterSpacing: "0.06em",
            color: theme.accent,
            textTransform: "uppercase",
          }}
        >
          “{displayTitle}”
        </div>

        {/* bottom row */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: theme.dim,
            }}
          >
            {GOA_COORDS}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: theme.dim,
            }}
          >
            #FRAMEINGOA
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- PFP frame (540 × 540) ---------- */

function PfpCard({ photo, crop, name, stack, style, onPhotoDrag }: CardRendererProps) {
  const theme = THEMES[style];
  const displayName = name.trim() || "YOUR NAME";
  const displayStack = stack.trim() || "BUILDER STACK";

  return (
    <div
      style={{
        width: 540,
        height: 540,
        background: theme.bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: theme.bgAccent }} />

      {/* real palm greenery from the reference art, growing from the bottom */}
      <PalmStrip style={style} height={150} pos="center 55%" />

      {/* foliage flanking the frame */}
      <div
        aria-hidden
        style={{ position: "absolute", left: -16, bottom: -8, width: 220, opacity: 0.42 }}
      >
        <LeafCluster
          color={FOLIAGE[style].color}
          accent={FOLIAGE[style].accent}
          style={{ width: "100%" }}
        />
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -20,
          bottom: -14,
          width: 210,
          opacity: 0.34,
          transform: "scaleX(-1)",
        }}
      >
        <LeafCluster
          color={FOLIAGE[style].color}
          accent={FOLIAGE[style].accent}
          style={{ width: "100%" }}
        />
      </div>

      {/* top arc text — concentric with the photo circle (center y = 236.5) */}
      <svg viewBox="0 0 540 540" style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <path id="hhgoa-arc" d="M 92 236.5 A 178 178 0 0 1 448 236.5" fill="none" />
        </defs>
        <text
          fontFamily="JetBrains Mono, monospace"
          fontSize="20"
          fontWeight="700"
          letterSpacing="6"
          fill={theme.accent}
        >
          <textPath href="#hhgoa-arc" startOffset="50%" textAnchor="middle">
            HH GOA 2026 — FRAME IN GOA —
          </textPath>
        </text>
      </svg>

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "26px 34px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: theme.ink,
            }}
          >
            HH GOA 2026
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.22em",
              color: theme.dim,
            }}
          >
            PFP — 001
          </span>
        </div>

        {/* photo */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "22px 0 12px",
          }}
        >
          {photo ? (
            <PhotoSlot
              dataUrl={photo.dataUrl}
              crop={crop}
              slotW={330}
              slotH={330}
              theme={theme}
              radius={165}
              onPhotoDrag={onPhotoDrag}
            />
          ) : (
            <div
              style={{
                width: 330,
                height: 330,
                borderRadius: "50%",
                border: "1.5px dashed rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: theme.dim,
              }}
            >
              YOUR PHOTO HERE
            </div>
          )}
        </div>

        {/* name — flexShrink 0 so it can never be crushed by the photo area */}
        <div
          style={{
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            fontSize: 32,
            lineHeight: 1.05,
            letterSpacing: "0.02em",
            color: theme.ink,
            textTransform: "uppercase",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </div>

        {/* stack */}
        <div style={{ flexShrink: 0, marginTop: 8, textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              letterSpacing: "0.26em",
              color: theme.sub,
              textTransform: "uppercase",
            }}
          >
            {displayStack}
          </span>
        </div>

        {/* bottom row */}
        <div
          style={{
            flexShrink: 0,
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: theme.dim,
            }}
          >
            {GOA_COORDS}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: theme.dim,
            }}
          >
            #FRAMEINGOA
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- entry ---------- */

export const CardRenderer = forwardRef<HTMLDivElement, CardRendererProps>(function CardRenderer(
  props,
  ref,
) {
  const { format } = props;
  const dims = FORMATS[format];
  return (
    <div
      ref={ref}
      style={{ width: dims.w, height: dims.h, flexShrink: 0 }}
      data-export-card={format}
    >
      {format === "id" ? <IdCard {...props} /> : <PfpCard {...props} />}
    </div>
  );
});
