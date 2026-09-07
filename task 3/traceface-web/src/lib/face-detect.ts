/**
 * Face Detection & Encoding Module
 * Uses @vladmandic/face-api for real client-side face detection.
 * Produces 128-d face descriptors for similarity comparison.
 */

import { sha256 } from "./utils";

export interface DetectedFace {
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
  descriptor: number[];
  index: number;
}

let faceApi: any = null;
let modelsLoaded = false;
let modelsLoading = false;

/**
 * Load face-api.js from npm package and initialize models from /models directory.
 * Models are served as static files from public/models/.
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoading) {
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (modelsLoaded) { clearInterval(check); resolve(); }
      }, 200);
    });
    return;
  }

  modelsLoading = true;

  const faceapi = await import("@vladmandic/face-api");
  faceApi = faceapi;

  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
  modelsLoading = false;
}

/**
 * Detect all faces in an image and generate 128-d descriptors.
 */
export async function detectFaces(
  imageElement: HTMLImageElement
): Promise<DetectedFace[]> {
  if (!faceApi) throw new Error("face-api not loaded. Call loadFaceModels() first.");

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

/**
 * Euclidean distance between two 128-d face descriptors.
 *
 * face-api.js models are FaceNet-based. FaceNet rule of thumb:
 * distance < 0.6 → same person, but 0.6 is a LOOSE boundary — different
 * people frequently land between 0.45 and 0.65. Treat only distances
 * ≤ 0.40 (cosine ≥ 0.92) as high-confidence same-person matches.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Cosine similarity between two 128-d face descriptors (0–1).
 *
 * This is the metric displayed to the user. IMPORTANT: for FaceNet-style
 * embeddings, cosine similarity is NOT calibrated like InsightFace/ArcFace.
 * Two DIFFERENT faces routinely score 0.80–0.88. Verified same-person
 * matches are almost always ≥ 0.92 (Euclidean ≤ ~0.40). Treating 85% as
 * a "high match" produced the false positives — see matchCategory() for
 * the honest bands.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

/**
 * Map FaceNet Euclidean distance to a 0–100 similarity percentage.
 *
 * Calibrated so face-api.js distance thresholds land on the standard
 * competition bands:
 *   d ≈ 0.40 → ~95%  (very high match)
 *   d ≈ 0.53 → ~85%  (high match)
 *   d ≈ 0.65 → ~75%  (possible match)
 *   d >  0.65 → below threshold → NOT a verified match
 */
export function distanceToPct(distance: number): number {
  const pct = 127 - 80 * distance;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

/**
 * Classify a cosine similarity (0–1) into an HONEST human-readable category.
 *
 * Calibrated for FaceNet/face-api.js descriptors where unrelated faces
 * routinely reach 0.80–0.88. Only ≥ 0.88 is treated as a genuine face
 * match; 0.80–0.88 is clearly labelled a POSSIBLE (visual) match and
 * below 0.80 is NOT a verified match. Never call these "identification".
 */
export function matchCategory(pct: number): { label: string; color: string } {
  if (pct >= 0.92) return { label: "VERY HIGH MATCH", color: "#34d399" };
  if (pct >= 0.88) return { label: "HIGH MATCH", color: "#2dd4bf" };
  if (pct >= 0.8) return { label: "POSSIBLE MATCH", color: "#f59e0b" };
  return { label: "NO VERIFIED MATCH", color: "#ef4444" };
}

/**
 * Compare a query descriptor against every usable face in a candidate image.
 *
 * Filters out low-quality detections first — tiny faces and low-confidence
 * detections produce noisy descriptors that inflate similarity and cause
 * false positives (common in product/social thumbnails). Returns the BEST
 * cosine similarity across all qualifying faces, or null if none qualify.
 */
export function compareCandidateFaces(
  query: number[],
  candidateFaces: DetectedFace[],
  opts: { minConfidence?: number; minSizePx?: number } = {}
): number | null {
  const minConfidence = opts.minConfidence ?? 0.6;
  const minSizePx = opts.minSizePx ?? 48;
  let best = -1;
  for (const f of candidateFaces) {
    if (f.confidence < minConfidence) continue;
    const size = Math.min(f.box.width, f.box.height);
    if (size < minSizePx) continue;
    const sim = cosineSimilarity(query, f.descriptor);
    if (sim > best) best = sim;
  }
  return best < 0 ? null : best;
}

/**
 * Best similarity percentage between a query descriptor and ANY face found
 * in a candidate image (compares every detected face, keeps the closest).
 * Returns null when there is nothing to compare.
 */
export function bestMatchPct(
  query: number[],
  candidateDescriptors: number[][]
): number | null {
  if (query.length === 0 || candidateDescriptors.length === 0) return null;
  let bestDistance = Infinity;
  for (const desc of candidateDescriptors) {
    const d = euclideanDistance(query, desc);
    if (d < bestDistance) bestDistance = d;
  }
  return distanceToPct(bestDistance);
}

/**
 * Deterministic hash of a face descriptor.
 */
export async function descriptorHash(descriptor: number[]): Promise<string> {
  const rounded = descriptor.map((v) => Math.round(v * 1e6) / 1e6);
  return sha256(JSON.stringify(rounded));
}

/**
 * Crop a face region from an image and return as data URL.
 */
export function cropFace(
  img: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  padding = 0.2
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const padX = box.width * padding;
  const padY = box.height * padding;
  const sx = Math.max(0, box.x - padX);
  const sy = Math.max(0, box.y - padY);
  const sw = Math.min(img.naturalWidth - sx, box.width + padX * 2);
  const sh = Math.min(img.naturalHeight - sy, box.height + padY * 2);
  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL("image/png");
}
