export type StyleId = "tropic" | "sunset" | "chrome";
export type FormatId = "id" | "pfp";

export interface Crop {
  /** Zoom relative to cover-fit. 1 = exactly fills the frame. */
  scale: number;
  /** Horizontal offset as a fraction of the slot width (-0.5..0.5). */
  x: number;
  /** Vertical offset as a fraction of the slot height (-0.5..0.5). */
  y: number;
  /** Rotation in degrees, applied around the slot center. */
  rotate: number;
}

export interface CardTheme {
  id: StyleId;
  label: string;
  index: string;
  tagline: string;
  bg: string;
  bgAccent: string;
  ink: string;
  sub: string;
  dim: string;
  accent: string;
  accent2: string;
  photoRing: string;
  glow: string;
  swatch: string;
}

export const THEMES: Record<StyleId, CardTheme> = {
  tropic: {
    id: "tropic",
    label: "TROPIC",
    index: "01",
    tagline: "FOREST · NEON · SHORE",
    bg: "linear-gradient(168deg, #04100a 0%, #07170e 46%, #0a2214 100%)",
    bgAccent:
      "radial-gradient(120% 90% at 18% 0%, rgba(52,211,153,0.26) 0%, rgba(52,211,153,0) 55%), radial-gradient(110% 80% at 100% 100%, rgba(45,212,191,0.16) 0%, rgba(45,212,191,0) 50%)",
    ink: "#ecfbf1",
    sub: "#a6c9b4",
    dim: "#5f7a69",
    accent: "#34d399",
    accent2: "#2dd4bf",
    photoRing: "linear-gradient(135deg, #86efac 0%, #34d399 45%, #2dd4bf 100%)",
    glow: "rgba(52,211,153,0.5)",
    swatch: "linear-gradient(160deg, #0d2b1a 0%, #123822 60%, #0b2b28 100%)",
  },
  sunset: {
    id: "sunset",
    label: "SUNSET",
    index: "02",
    tagline: "GOLDEN HOUR · GOA DUSK",
    bg: "linear-gradient(168deg, #190b06 0%, #2d160a 48%, #46220d 100%)",
    bgAccent:
      "radial-gradient(120% 90% at 85% 0%, rgba(255,180,94,0.28) 0%, rgba(255,180,94,0) 55%), radial-gradient(110% 80% at 0% 100%, rgba(245,197,66,0.18) 0%, rgba(245,197,66,0) 50%)",
    ink: "#fff6e6",
    sub: "#f0cfae",
    dim: "#b08a68",
    accent: "#ffb45e",
    accent2: "#f5c542",
    photoRing: "linear-gradient(135deg, #ffe3b0 0%, #ff9a3d 45%, #ff6b6b 100%)",
    glow: "rgba(255,150,80,0.5)",
    swatch: "linear-gradient(160deg, #3a1d0a 0%, #5c3110 60%, #2b1308 100%)",
  },
  chrome: {
    id: "chrome",
    label: "CHROME",
    index: "03",
    tagline: "METALLIC · JUNGLE REFLECT",
    bg: "linear-gradient(168deg, #101312 0%, #1d2520 45%, #0a0d0b 100%)",
    bgAccent:
      "radial-gradient(120% 90% at 20% 0%, rgba(200,230,214,0.14) 0%, rgba(200,230,214,0) 55%), radial-gradient(110% 80% at 100% 100%, rgba(52,211,153,0.20) 0%, rgba(52,211,153,0) 50%)",
    ink: "#f0f5f1",
    sub: "#b6c8bb",
    dim: "#75877b",
    accent: "#e6f2ea",
    accent2: "#34d399",
    photoRing: "linear-gradient(135deg, #ffffff 0%, #b9d4c6 40%, #34d399 100%)",
    glow: "rgba(180,215,195,0.45)",
    swatch: "linear-gradient(160deg, #2e3d34 0%, #1b2420 55%, #101612 100%)",
  },
};

export const STYLE_ORDER: StyleId[] = ["tropic", "sunset", "chrome"];

export const FORMATS: Record<
  FormatId,
  { id: FormatId; label: string; short: string; w: number; h: number; ratio: number }
> = {
  id: { id: "id", label: "BUILDER ID", short: "ID", w: 540, h: 675, ratio: 675 / 540 },
  pfp: { id: "pfp", label: "PFP FRAME", short: "PFP", w: 540, h: 540, ratio: 1 },
};

/** Goa coordinates — a subtle place reference on the cards. */
export const GOA_COORDS = "15.2993° N, 74.1240° E";
