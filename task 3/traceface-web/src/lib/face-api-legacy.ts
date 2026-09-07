/**
 * LEGACY face-api.js path — kept ONLY for the model A/B comparison test
 * page (src/app/modeltest/page.tsx). The production app uses the
 * @vladmandic/human implementation in face-detect.ts.
 *
 * The face-api FaceNet model is retained here so the test page can show
 * side-by-side scores proving the new model eliminates false positives.
 */

import type { DetectedFace } from "./face-detect";

let faceApi: any = null;
let loaded = false;
let loading = false;

export async function loadLegacyModels(): Promise<void> {
  if (loaded) return;
  if (loading) {
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (loaded) { clearInterval(check); resolve(); }
      }, 200);
    });
    return;
  }
  loading = true;
  const faceapi = await import("@vladmandic/face-api");
  faceApi = faceapi;
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);
  loaded = true;
  loading = false;
}

export async function detectFacesLegacy(
  imageElement: HTMLImageElement
): Promise<DetectedFace[]> {
  if (!faceApi) throw new Error("face-api not loaded");
  const detections = await faceApi
    .detectAllFaces(imageElement, new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (!detections || detections.length === 0) return [];
  return detections
    .sort((a: any, b: any) => b.detection.score - a.detection.score)
    .map((det: any, i: number) => {
      const box = det.detection.box;
      return {
        box: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height },
        confidence: det.detection.score,
        descriptor: Array.from(det.descriptor),
        index: i,
      };
    });
}

/** Re-encode a face from an upscaled crop using the legacy model. */
export async function encodeFaceUpscaledLegacy(
  img: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  targetSize = 224,
  padding = 0.35
): Promise<number[] | null> {
  if (!faceApi) throw new Error("face-api not loaded");
  const padX = box.width * padding;
  const padY = box.height * padding;
  const sx = Math.max(0, box.x - padX);
  const sy = Math.max(0, box.y - padY);
  const sw = Math.min(img.naturalWidth - sx, box.width + padX * 2);
  const sh = Math.min(img.naturalHeight - sy, box.height + padY * 2);
  if (!sw || !sh || sw < 8 || sh < 8) return null;
  const scale = Math.min(6, Math.max(1, targetSize / Math.min(sw, sh)));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const det = await faceApi
    .detectSingleFace(canvas, new faceApi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (!det || !det.descriptor) return null;
  return Array.from(det.descriptor);
}

/** Cosine similarity (same math as face-detect.ts) for legacy scores. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}