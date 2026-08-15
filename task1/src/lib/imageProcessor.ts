export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_SIDE = 2560;

export const SUPPORTED_HINTS = "JPG · PNG · WebP · HEIC";

export function looksLikeHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.heic$/i.test(file.name);
}

function isSupportedImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return looksLikeHeic(file);
}

export interface PhotoError {
  code: "unsupported" | "too-large" | "decode" | "heic";
  message: string;
}

/**
 * Decodes an uploaded file into a normalized, orientation-corrected JPEG
 * data URL capped at MAX_SIDE. HEIC files are converted in-browser via
 * heic2any. Everything runs on the client — no uploads, no storage.
 */
export async function processPhoto(file: File): Promise<ProcessedImage> {
  if (!isSupportedImage(file)) {
    throw {
      code: "unsupported",
      message: "That file isn't a photo. Try a JPG, PNG or WebP.",
    } satisfies PhotoError;
  }
  if (file.size > 25 * 1024 * 1024) {
    throw {
      code: "too-large",
      message: "That photo is over 25 MB. Pick a smaller one.",
    } satisfies PhotoError;
  }

  let blob: Blob = file;
  if (looksLikeHeic(file)) {
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.95,
      });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch {
      throw {
        code: "heic",
        message: "Couldn't decode that HEIC photo. Try a JPG or PNG instead.",
      } satisfies PhotoError;
    }
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    throw {
      code: "decode",
      message: "That photo couldn't be processed. Try a JPG or PNG.",
    } satisfies PhotoError;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw { code: "decode", message: "Your browser couldn't process that photo." } satisfies PhotoError;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return { dataUrl: canvas.toDataURL("image/jpeg", 0.95), width: w, height: h };
}
