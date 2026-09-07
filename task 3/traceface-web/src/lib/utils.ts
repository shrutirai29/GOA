/**
 * Compute SHA-256 hash of a string (browser-compatible)
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Canonical JSON serialization (sorted keys, no whitespace)
 */
export function canonicalJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj), null, 0);
}

function sortKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);
  return Object.keys(obj as Record<string, unknown>)
    .sort()
    .reduce((acc, key) => {
      (acc as Record<string, unknown>)[key] = sortKeys(
        (obj as Record<string, unknown>)[key]
      );
      return acc;
    }, {} as Record<string, unknown>);
}

/**
 * Generate a UUID v4
 */
export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Downscale + re-encode an image data URL as a JPEG small enough for
 * reverse-image-search providers (SerpAPI caps uploads at 500 KB).
 *
 * Strategy: cap longest side at 1024px, then step JPEG quality down until
 * the encoded payload fits under maxBytes; if still too large, shrink the
 * canvas dimensions and retry.
 */
export async function compressImageForSearch(
  dataUrl: string,
  maxBytes = 450_000
): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not decode image for upload"));
    img.src = dataUrl;
  });

  const MAX_DIM = 1024;
  let w = img.naturalWidth || 800;
  let h = img.naturalHeight || 600;
  if (Math.max(w, h) > MAX_DIM) {
    const s = MAX_DIM / Math.max(w, h);
    w = Math.max(1, Math.round(w * s));
    h = Math.max(1, Math.round(h * s));
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  const qualities = [0.85, 0.7, 0.55, 0.4];

  for (let attempt = 0; attempt < 4; attempt++) {
    for (const q of qualities) {
      canvas.width = w;
      canvas.height = h;
      // Flatten any transparency onto a dark background (JPEG has no alpha)
      ctx.fillStyle = "#0a0f0d";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", q);
      // base64 is ~4/3 the size of the raw bytes
      if (out.length * 0.75 <= maxBytes) return out;
    }
    // Still too large → shrink dimensions and try again
    w = Math.max(64, Math.round(w * 0.7));
    h = Math.max(64, Math.round(h * 0.7));
  }

  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d");
  if (c) {
    c.fillStyle = "#0a0f0d";
    c.fillRect(0, 0, w, h);
    c.drawImage(img, 0, 0, w, h);
  }
  return canvas.toDataURL("image/jpeg", 0.4);
}
