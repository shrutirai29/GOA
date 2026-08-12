import type { Crop } from "./cardStyles";

/** Crop in pixel space (x/y relative to the slot). */
export interface CropPx {
  scale: number;
  x: number;
  y: number;
  rotate: number;
}

export interface PanBounds {
  minScale: number;
  maxX: number;
  maxY: number;
}

/**
 * Given a cover-fit image inside a slot, computes pan/zoom limits so the slot
 * stays covered even when the image is rotated.
 */
export function panBounds(slotW: number, slotH: number, scale: number, rotate: number): PanBounds {
  const r = (rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));

  // Bounding box of the scaled+rotated slot-sized box must cover the slot.
  const minScale = Math.max(
    slotW / (slotW * cos + slotH * sin),
    slotH / (slotW * sin + slotH * cos),
  );

  const effW = scale * (slotW * cos + slotH * sin);
  const effH = scale * (slotW * sin + slotH * cos);

  return {
    minScale,
    maxX: Math.max(0, (effW - slotW) / 2),
    maxY: Math.max(0, (effH - slotH) / 2),
  };
}

/** Clamps a pixel-space crop so the slot stays covered and pan stays in range. */
export function clampCropPx(crop: CropPx, slotW: number, slotH: number): CropPx {
  const { minScale } = panBounds(slotW, slotH, crop.scale, crop.rotate);
  const scale = Math.max(minScale, Math.min(3, crop.scale));
  const { maxX, maxY } = panBounds(slotW, slotH, scale, crop.rotate);
  return {
    scale,
    x: Math.max(-maxX, Math.min(maxX, crop.x)),
    y: Math.max(-maxY, Math.min(maxY, crop.y)),
    rotate: crop.rotate,
  };
}

/** Convert fraction-space state into clamped pixel-space values for a slot. */
export function cropToPx(crop: Crop, slotW: number, slotH: number): CropPx {
  return clampCropPx(
    { scale: crop.scale, x: crop.x * slotW, y: crop.y * slotH, rotate: crop.rotate },
    slotW,
    slotH,
  );
}

/** Convert pixel-space values back into fraction-space state. */
export function cropFromPx(crop: CropPx, slotW: number, slotH: number): Crop {
  return { scale: crop.scale, x: crop.x / slotW, y: crop.y / slotH, rotate: crop.rotate };
}

/** CSS transform for a cover-fit <img> inside a slot (pixel-space crop). */
export function photoTransformCss(crop: CropPx): React.CSSProperties {
  return {
    transform: `translate(${crop.x}px, ${crop.y}px) rotate(${crop.rotate}deg) scale(${crop.scale})`,
    transformOrigin: "center center",
    willChange: "transform",
  };
}

/** Smart default: bias the frame slightly above center for typical portraits. */
export function defaultCrop(imageW: number, imageH: number): Crop {
  const isPortrait = imageH > imageW * 1.05;
  return { scale: 1, x: 0, y: isPortrait ? 0.08 : 0, rotate: 0 };
}
