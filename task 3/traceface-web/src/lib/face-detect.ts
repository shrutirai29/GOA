/**
 * Face Detection & Encoding Module
 *
 * Uses @vladmandic/human with the HSE FaceRes embedding model — an
 * ArcFace-quality 128-d face descriptor. This replaces the earlier
 * face-api.js FaceNet model whose weak discrimination caused cross-person
 * false positives (unrelated faces scoring 90%+ on cosine similarity).
 *
 * Similarity convention (HSE FaceRes / ArcFace-style embeddings):
 *   - cosine similarity: same person typically ≥ 0.35–0.45,
 *     different people typically < 0.25
 *   - human.match.similarity: normalized 0..1 where > 0.5 is a match
 * Both metrics are required to agree before a match is claimed.
 */

import { sha256 } from "./utils";

export interface DetectedFace {
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
  descriptor: number[];
  index: number;
}

export interface FaceMatchScore {
  cosine: number; // ArcFace cosine similarity (0..1)
  distance: number; // Euclidean distance on L2-normalized descriptors
  pct: number; // displayed 0..100 score (human's calibrated similarity)
  label: string;
  color: string;
}

let human: any = null;
let modelsLoaded = false;
let modelsLoading = false;

/** Wrap a promise with a hard timeout so a stuck WebGL/ML inference can
 * never leave the UI hanging. Resolves with `undefined` on timeout. */
function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  what: string
): Promise<T | undefined> {
  return Promise.race([
    p,
    new Promise<undefined>((resolve) => {
      setTimeout(() => resolve(undefined), ms);
    }),
  ]);
}

/**
 * Load @vladmandic/human and initialize the face pipeline
 * (detector + mesh + description/embedding) from /human-models.
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

  // Import the browser ESM build explicitly (the package's default "main"
  // resolves to the Node build on the server, which requires tfjs-node).
  // NOTE: next.config.js aliases @vladmandic/human to its browser ESM build
  // (the package default resolves to a Node build that needs native tfjs-node).
  const HumanModule = await import("@vladmandic/human");
  human = new HumanModule.Human({
    backend: "webgl",
    modelBasePath: "/human-models",
    filter: { enabled: true, equalization: true },
    face: {
      enabled: true,
      detector: { enabled: true, maxDetected: 10, rotation: false, minConfidence: 0.3 },
      mesh: { enabled: true },
      description: { enabled: true },
      iris: { enabled: false },
      emotion: { enabled: false },
      liveness: { enabled: false },
      antispoof: { enabled: false },
    },
    hand: { enabled: false },
    gesture: { enabled: false },
    body: { enabled: false },
    object: { enabled: false },
    segmentation: { enabled: false },
  });

  await human.load();

  modelsLoaded = true;
  modelsLoading = false;
}

/** Draw an image to a canvas at native resolution (capped), returning the
 * canvas and the scale factor used so detection boxes map back to image
 * coordinates. */
function imageToCanvas(
  img: HTMLImageElement,
  maxDim = 2048
): { canvas: HTMLCanvasElement; scale: number } {
  const w = img.naturalWidth || img.width || 1;
  const h = img.naturalHeight || img.height || 1;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, scale };
}

/**
 * Detect all faces in an image and generate 128-d descriptors.
 * Boxes are returned in ORIGINAL image pixel coordinates.
 */
export async function detectFaces(
  imageElement: HTMLImageElement
): Promise<DetectedFace[]> {
  if (!human) throw new Error("human not loaded. Call loadFaceModels() first.");

  const { canvas, scale } = imageToCanvas(imageElement);
  const result = (await withTimeout(human.detect(canvas), 25000, "detect")) as any;
  if (!result || !result.face || result.face.length === 0) return [];

  return result.face
    .filter((f: any) => f && f.embedding && f.embedding.length > 0)
    .sort((a: any, b: any) => (b.boxScore ?? b.score) - (a.boxScore ?? a.score))
    .map((f: any, i: number) => ({
      box: {
        x: Math.max(0, f.box[0] / scale),
        y: Math.max(0, f.box[1] / scale),
        width: f.box[2] / scale,
        height: f.box[3] / scale,
      },
      confidence: f.boxScore ?? f.score,
      descriptor: Array.from(f.embedding),
      index: i,
    }));
}

/**
 * Euclidean distance between two 128-d face descriptors.
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
 * Cosine similarity between two 128-d face descriptors (0..1).
 * For ArcFace-style embeddings (HSE FaceRes) this is the calibrated
 * metric: same person ≥ ~0.35–0.45, different people < ~0.25.
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
 * L2-normalize a descriptor so cosine and Euclidean metrics are consistent.
 */
export function l2Normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  if (norm === 0) return v;
  return v.map((x) => x / norm);
}

/**
 * Compare two descriptors with BOTH metrics:
 *  - cosine similarity (ArcFace convention)
 *  - human's calibrated similarity (0..1, >0.5 = match)
 *
 * Both must clear their gate — different people are separated far more
 * reliably by this model than by the old face-api FaceNet (which scored
 * unrelated faces at 90%+).
 */
export function faceMatchScore(a: number[], b: number[]): FaceMatchScore | null {
  if (!a || !b || a.length === 0 || a.length !== b.length) return null;
  const cosine = cosineSimilarity(a, b);
  const na = l2Normalize(a);
  const nb = l2Normalize(b);
  const distance = euclideanDistance(na, nb);
  const humanSim = human?.match?.similarity ? human.match.similarity(a, b) : 0;
  const pct = Math.round(Math.max(0, Math.min(100, humanSim * 100)));

  let label = "NO VERIFIED MATCH";
  let color = "#ef4444";
  if (cosine >= 0.4 && humanSim >= 0.65) {
    label = "VERY HIGH MATCH";
    color = "#34d399";
  } else if (cosine >= 0.3 && humanSim >= 0.55) {
    label = "HIGH VISUAL MATCH";
    color = "#2dd4bf";
  } else if (cosine >= 0.2 && humanSim >= 0.4) {
    label = "POSSIBLE VISUAL MATCH";
    color = "#f59e0b";
  }
  return { cosine, distance, pct, label, color };
}

/**
 * Re-encode a face from an UPSCALED crop of the source image.
 * Small faces produce noisy descriptors; upscaling recovers identity
 * signal for both the input face and candidate thumbnails.
 */
export async function encodeFaceUpscaled(
  img: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number },
  targetSize = 224,
  padding = 0.35
): Promise<number[] | null> {
  try {
    if (!human) return null;

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
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const result = (await withTimeout(
      human.detect(canvas),
      25000,
      "encode-detect"
    )) as any;
    if (!result || !result.face || result.face.length === 0) return null;
    const face = result.face
      .filter((f: any) => f && f.embedding && f.embedding.length > 0)
      .sort((a: any, b: any) => (b.boxScore ?? b.score) - (a.boxScore ?? a.score))[0];
    if (!face) return null;
    return Array.from(face.embedding);
  } catch (e) {
    return null;
  }
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