"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Search, Target, FileCode, Link, CheckCircle,
  AlertTriangle, Eye, Fingerprint, Shield, Lock, Zap,
  Loader2, Globe, X,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import {
  loadFaceModels,
  detectFaces,
  encodeFaceUpscaled,
  encodeFaceAveraged,
  faceMatchScore,
  descriptorHash,
  cropFace,
  MATCH_BANDS,
  type DetectedFace,
} from "@/lib/face-detect";
import { sha256, canonicalJson, compressImageForSearch } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

interface SearchRes {
  title: string; url: string; imageUrl: string;
  domain: string; snippet: string; provider: string; position: number;
}

interface ProcessedRes extends SearchRes {
  imageDownloaded: boolean;
  faceInResult: boolean;
  similarity: number | null; // 0..1 display score (distance-derived)
  distance: number | null; // Euclidean distance (native FaceNet metric)
  matchLabel: string;
  resultImageHash: string;
}

interface EvidencePkg {
  caseId: string; createdAt: string; inputImageHash: string;
  faceDescriptorHash: string; searchProvider: string; searchTimestamp: string;
  resultTitle: string; sourceUrl: string; sourceDomain: string;
  resultImageHash: string; similarityScore: number;
  metadata: Record<string, unknown>;
}

interface BCReceipt {
  txHash: string; blockNumber: number; timestamp: string;
  from: string; contractAddress: string; networkName: string;
  explorerUrl?: string; gasUsed?: number; status: string; mode: string;
}

const STEPS = [
  { id: 0, icon: Upload, title: "UPLOAD & DETECT", short: "Face Scan", color: "#34d399" },
  { id: 1, icon: Search, title: "WEB SEARCH", short: "Visual Search", color: "#2dd4bf" },
  { id: 2, icon: Target, title: "MATCH RESULTS", short: "Matching", color: "#06b6d4" },
  { id: 3, icon: FileCode, title: "EVIDENCE PACKAGE", short: "Hashing", color: "#8b5cf6" },
  { id: 4, icon: Link, title: "BLOCKCHAIN", short: "On-Chain", color: "#f59e0b" },
  { id: 5, icon: CheckCircle, title: "VERIFICATION", short: "Verify", color: "#34d399" },
];

/* Honest similarity bands, calibrated for the @vladmandic/human HSE
 * FaceRes model (library convention: similarity > 0.5 = a match):
 *   pct ≥ 65 → VERY HIGH MATCH   (same-person, near-certain)
 *   pct ≥ 55 → HIGH VISUAL MATCH (verified same-person floor)
 *   pct ≥ 50 → POSSIBLE VISUAL MATCH
 *   below    → NO VERIFIED MATCH
 * These replace the old face-api.js FaceNet thresholds (88/95%) that no
 * real cross-photo match on the HSE scale could ever reach. */
const VERIFIED_FLOOR = MATCH_BANDS.HIGH; // 0.55
const HIGH_FLOOR = MATCH_BANDS.VERY_HIGH; // 0.65

/* ─── Helpers ──────────────────────────────────────────────────── */

/** Hash raw binary bytes via SubtleCrypto */
async function hashBytes(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Load an image with CORS + timeout, as a Promise. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
    setTimeout(() => reject(new Error("load timeout")), 5000);
  });
}

/* ─── Component ──────────────────────────────────────────────────── */

export function Pipeline() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [modelsReady, setModelsReady] = useState(false);

  // Step 1: Face
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState("");
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [selectedFace, setSelectedFace] = useState<number>(0);
  const [descriptor, setDescriptor] = useState<number[]>([]);
  const [descHash, setDescHash] = useState("");
  const [faceCropUrl, setFaceCropUrl] = useState<string | null>(null);

  // Step 2: Search
  const [searchMode, setSearchMode] = useState<"live" | "demo" | null>(null);
  const [searchProvider, setSearchProvider] = useState("");
  const [rawResults, setRawResults] = useState<SearchRes[]>([]);

  // Step 3: Match
  const [processed, setProcessed] = useState<ProcessedRes[]>([]);
  const [selectedResult, setSelectedResult] = useState<ProcessedRes | null>(null);

  // Step 4: Evidence
  const [evidence, setEvidence] = useState<EvidencePkg | null>(null);
  const [evidenceHash, setEvidenceHash] = useState("");

  // Step 5: Blockchain
  const [bcReceipt, setBcReceipt] = useState<BCReceipt | null>(null);
  const [bcMode, setBcMode] = useState("");

  // Step 6: Verify
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyHash, setVerifyHash] = useState("");
  const [tamperResult, setTamperResult] = useState<{
    orig: string; tampered: string; field: string; fail: boolean;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [lowQualityInput, setLowQualityInput] = useState(false);

  const log = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((p) => [...p, `[${ts}] ${msg}`]);
  }, []);

  // Load face models on mount
  useEffect(() => {
    loadFaceModels()
      .then(() => { setModelsReady(true); log("Face detection models loaded"); })
      .catch((e) => log("Model load error: " + (e as Error).message));
  }, [log]);

  /* ─── STEP 0: Upload & Detect ──────────────────────────────── */

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    log("Image received: " + file.name);

    // Read file as data URL (base64) — used for both display and API
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
      setImageBase64(dataUrl);
      setImageFile(file);

      // Compute image hash from raw bytes
      const buf = await file.arrayBuffer();
      const hash = await hashBytes(buf);
      setImageHash(hash);
      log("Image SHA-256: " + hash.slice(0, 16) + "...");

      // Detect faces
      log("Detecting faces...");
      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        try {
          const detected = await detectFaces(img);
          if (detected.length === 0) {
            log("⚠ No faces detected in image. Please upload a clearer face photo.");
            setLoading(false);
            return;
          }
          setFaces(detected);
          log(detected.length + " face(s) detected");
          detected.forEach((f, i) => {
            log(`  Face ${i}: confidence ${(f.confidence * 100).toFixed(1)}%`);
          });
        } catch (err) {
          log("Face detection error: " + (err as Error).message);
        }
        setLoading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleEncode = async () => {
    if (!imageUrl || faces.length === 0) return;
    setLoading(true);
    log("Encoding face " + selectedFace + "...");

    const img = new Image();
    img.src = imageUrl;
    img.onload = async () => {
      try {
        const face = faces[selectedFace];
        const faceSize = Math.min(face.box.width, face.box.height);
        if (faceSize < 64) {
          setLowQualityInput(true);
          log("⚠ Input face is small (" + Math.round(faceSize) + "px) — re-encoding from an upscaled crop to avoid inflated similarity");
        }

        // Re-encode from MULTIPLE upscaled crops and average the result:
        // small/screenshot faces produce noisy single-crop descriptors that
        // drift toward an "average face" and score ~equal against everyone.
        // Multi-crop averaging stabilizes the anchor descriptor.
        let improved: number[] | null = null;
        try {
          improved = await encodeFaceAveraged(img, face.box);
        } catch {
          improved = null;
        }
        const desc = improved ?? face.descriptor;
        setDescriptor(desc);

        const hash = await descriptorHash(desc);
        setDescHash(hash);
        log("Face embedding generated (1024-d HSE descriptor)" + (improved ? " — multi-crop averaged" : ""));
        log("Descriptor hash: " + hash.slice(0, 16) + "...");

        // Crop face for thumbnail
        const crop = cropFace(img, face.box);
        setFaceCropUrl(crop);

        setStep(1);
        log("✓ Ready for web search — click SEARCH THE WEB");
      } catch (err) {
        log("✗ Face encoding error: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    img.onerror = () => {
      log("✗ Could not load the uploaded image for encoding");
      setLoading(false);
    };
  };

  /* ─── STEP 1: Web Search ───────────────────────────────────── */

  const handleSearch = async () => {
    // Search the CROPPED FACE REGION — submitting the full photo makes Google
    // Lens match clothing/background instead of the face.
    if (!faceCropUrl) {
      log("⚠ Encode the selected face first — the web search uses the cropped face region, not the whole photo");
      return;
    }
    setLoading(true);
    setStep(1);
    log("[1/4] Cropping face region for visual search...");

    try {
      // Downscale/compress so the upload fits provider limits (SerpAPI: 500 KB)
      const searchImage = await compressImageForSearch(faceCropUrl);
      log("[2/4] Submitting face region to visual search provider...");
      const resp = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: searchImage }),
      });

      const data = await resp.json();
      setSearchMode(data.mode);
      setSearchProvider(data.provider || "Unknown");

      if (data.mode === "demo") {
        log("⚠ DEMO MODE — No real search performed");
        log("Set SERPAPI_KEY or BING_API_KEY for live web search");
      } else if (data.mode === "live") {
        log("✓ Live search via " + data.provider);
      } else if (data.mode === "error") {
        log("✗ Search provider error: " + (data.message || "Unknown error"));
      }

      log("[3/4] " + (data.totalResults || 0) + " public visual matches discovered");
      setRawResults(data.results || []);

      if (data.mode === "error") {
        setLoading(false);
        setStep(2);
        return;
      }

      // Process results: download images and compare faces
      log("[4/4] Comparing facial embeddings across candidates...");
      const processedResults = await processSearchResults(data.results || []);
      setProcessed(processedResults);

      const withSim = processedResults.filter((r) => r.similarity !== null);
      const matches = withSim.filter((r) => r.similarity! >= VERIFIED_FLOOR);
      const strong = matches.filter((r) => r.similarity! >= HIGH_FLOOR);
      log("✓ " + withSim.length + " candidates scored by face similarity");
      if (matches.length > 0) {
        log("✓ " + matches.length + " candidate(s) at/above " + Math.round(VERIFIED_FLOOR * 100) + "% verified-match floor");
        if (strong.length > 0) {
          log("✓ " + strong.length + " high-confidence face match(es) (≥" + Math.round(HIGH_FLOOR * 100) + "%)");
        }
      } else {
        // No face cleared the verified floor — but surface the strongest
        // candidate so the investigation can still proceed honestly.
        const top = [...withSim].sort((a, b) => (b.similarity as number) - (a.similarity as number))[0];
        if (top) {
          log("⚠ No candidate reached the " + Math.round(VERIFIED_FLOOR * 100) + "% verified-match floor");
          log("  Top visual candidate: " + (top.similarity! * 100).toFixed(1) + "% — " + top.title.slice(0, 40));
          log("  → Same-person match NOT confirmed. You can still select it as the best available visual candidate.");
        } else {
          log("⚠ No candidate image contained a detectable face to compare");
        }
      }

      setStep(2);
    } catch (err) {
      log("✗ Search error: " + (err as Error).message);
    }
    setLoading(false);
  };

  const processSearchResults = async (results: SearchRes[]): Promise<ProcessedRes[]> => {
    const processed: ProcessedRes[] = [];

    for (const res of results.slice(0, 15)) {
      const pr: ProcessedRes = {
        ...res,
        imageDownloaded: false,
        faceInResult: false,
        similarity: null,
        distance: null,
        matchLabel: "",
        resultImageHash: "",
      };

      if (res.imageUrl) {
        try {
          const img = await loadImage(res.imageUrl);
          pr.imageDownloaded = true;

          // Compute result image hash via canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), "image/png")
          );
          const buf = await blob.arrayBuffer();
          pr.resultImageHash = await hashBytes(buf);

          // Detect faces in the candidate image. Small/soft thumbs are
          // expected (Lens/LinkedIn thumbnails), so keep a LOW size floor
          // here and re-encode every qualifying face from an upscaled crop
          // below — upscaling is what recovers identity signal.
          const detected = await detectFaces(img);
          if (detected.length > 0 && descriptor.length > 0) {
            pr.faceInResult = true;
            let best: { pct: number; distance: number; label: string } | null = null;
            for (const f of detected) {
              if (f.confidence < 0.5) continue;
              if (Math.min(f.box.width, f.box.height) < 28) continue;
              // PASS — upscaled re-encode for EVERY candidate face so a
              // genuine match is never missed because its thumbnail was small.
              const candDesc = (await encodeFaceUpscaled(img, f.box)) ?? f.descriptor;
              const score = faceMatchScore(descriptor, candDesc);
              if (score && (!best || score.pct > best.pct)) {
                best = { pct: score.pct, distance: score.distance, label: score.label };
              }
            }
            if (best) {
              pr.similarity = best.pct / 100;
              pr.distance = best.distance;
              pr.matchLabel = best.label;
            } else {
              pr.matchLabel = "NO FACE QUALIFIES";
            }
          }
        } catch {
          // Image not loadable (CORS, network, etc) — skip face comparison
        }
      }

      processed.push(pr);
    }

    // Final sort by similarity (highest first), nulls last
    processed.sort((a, b) => {
      if (a.similarity === null && b.similarity === null) return 0;
      if (a.similarity === null) return 1;
      if (b.similarity === null) return -1;
      return b.similarity - a.similarity;
    });

    return processed;
  };

  /* ─── STEP 2: Select Result ────────────────────────────────── */

  const handleSelect = (res: ProcessedRes) => {
    setSelectedResult(res);
    log("Selected: " + res.title.slice(0, 50));
    log("Similarity: " + (res.similarity !== null ? (res.similarity * 100).toFixed(1) + "%" : "N/A"));
    setStep(3);
  };

  /* ─── STEP 3: Evidence Package ─────────────────────────────── */

  const handleGenerateEvidence = async () => {
    if (!selectedResult) return;
    setLoading(true);
    log("Creating tamper-evident evidence package...");

    const pkg: EvidencePkg = {
      caseId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      inputImageHash: imageHash,
      faceDescriptorHash: descHash,
      searchProvider: searchProvider,
      searchTimestamp: new Date().toISOString(),
      resultTitle: selectedResult.title,
      sourceUrl: selectedResult.url,
      sourceDomain: selectedResult.domain,
      resultImageHash: selectedResult.resultImageHash,
      similarityScore: selectedResult.similarity ?? 0,
      metadata: {
        matchLabel: selectedResult.matchLabel,
        faceInResult: selectedResult.faceInResult,
        searchMode: searchMode,
      },
    };

    setEvidence(pkg);

    const canonical = canonicalJson(pkg);
    const hash = await sha256(canonical);
    setEvidenceHash(hash);

    log("✓ Canonical JSON serialized");
    log("✓ SHA-256 evidence hash: " + hash.slice(0, 16) + "...");
    log("✓ Evidence ID: TF-" + pkg.caseId.slice(0, 8).toUpperCase());
    setStep(4);
    setLoading(false);
  };

  /* ─── STEP 4: Blockchain ───────────────────────────────────── */

  const handleBlockchain = async () => {
    if (!evidence) return;
    setLoading(true);
    log("Connecting to blockchain...");

    try {
      const resp = await fetch("/api/blockchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          evidenceHash: "0x" + evidenceHash,
          caseId: evidence.caseId,
          sourceFingerprint: "TraceFace Evidence: TF-" + evidence.caseId.slice(0, 8).toUpperCase(),
        }),
      });
      const data = await resp.json();

      if (data.success) {
        const receipt: BCReceipt = {
          txHash: data.txHash,
          blockNumber: data.blockNumber,
          timestamp: data.timestamp,
          from: data.from,
          contractAddress: data.contractAddress,
          networkName: data.networkName,
          explorerUrl: data.explorerUrl,
          gasUsed: data.gasUsed,
          status: data.status,
          mode: data.mode,
        };
        setBcReceipt(receipt);
        setBcMode(data.mode);

        log("✓ Network: " + data.networkName);
        log("✓ Transaction submitted");
        log("✓ Block #" + data.blockNumber);
        log("✓ TX: " + data.txHash.slice(0, 18) + "...");
        if (data.mode === "demo") {
          log("⚠ DEMO MODE — Simulated blockchain receipt");
        } else {
          log("✓ Transaction confirmed on-chain");
        }
        setStep(5);
      } else {
        log("✗ Blockchain error: " + (data.message || data.error));
      }
    } catch (err) {
      log("✗ Blockchain connection failed: " + (err as Error).message);
    }
    setLoading(false);
  };

  /* ─── STEP 5: Re-verify ────────────────────────────────────── */

  const handleVerify = async () => {
    if (!evidence) return;
    setLoading(true);
    log("Re-verifying evidence against blockchain...");

    try {
      const resp = await fetch("/api/blockchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          evidenceHash: "0x" + evidenceHash,
          caseId: evidence.caseId,
        }),
      });
      const data = await resp.json();
      setVerified(data.verified);
      setVerifyHash(evidenceHash);
      log(data.verified
        ? "✓ VERIFIED — Evidence hash matches blockchain record"
        : "✗ FAILED — " + data.message);
    } catch (err) {
      setVerified(false);
      log("✗ Verification error: " + (err as Error).message);
    }
    setLoading(false);
  };

  const handleTamper = async () => {
    if (!evidence) return;
    log("Simulating data tampering...");

    // Tamper: modify source_url
    const tampered = { ...evidence, sourceUrl: evidence.sourceUrl + " [TAMPERED]" };
    const origHash = evidenceHash;
    const tamperedHash = await sha256(canonicalJson(tampered));
    const fail = origHash !== tamperedHash;

    setTamperResult({ orig: origHash, tampered: tamperedHash, field: "sourceUrl", fail });
    log("Original hash:  " + origHash.slice(0, 16) + "...");
    log("Tampered hash:  " + tamperedHash.slice(0, 16) + "...");
    log(fail
      ? "✗ HASH MISMATCH — Blockchain verification would FAIL"
      : "Unexpected: hashes match");
  };

  /* ─── Render ───────────────────────────────────────────────── */

  return (
    <section id="pipeline" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        style={{ background: "radial-gradient(65% 100% at 50% 0%, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0) 70%)" }} />

      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.34em] text-electric">INVESTIGATION PIPELINE</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] uppercase leading-[0.95]">
          Trace a face.<br />
          <span className="text-outline">Prove it on-chain.</span>
        </h2>
        {!modelsReady && (
          <p className="mt-2 font-mono text-[11px] text-amber animate-pulse">
            Loading face detection models...
          </p>
        )}
      </Reveal>

      {/* Step indicators */}
      <div className="mt-14 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <motion.div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] transition-all duration-300 ${
                step >= s.id
                  ? "border border-electric/30 bg-electric/10 text-electric"
                  : "border border-white/10 bg-white/5 text-dim"
              }`}
              animate={step === s.id ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <s.icon size={12} />
              <span className="hidden sm:inline">{s.short}</span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-px w-4 sm:w-8 transition-colors duration-500 ${
                step > s.id ? "bg-electric/40" : "bg-white/10"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left panel */}
        <div className="rounded-3xl border border-white/10 bg-[#0a1610]/80 p-6 backdrop-blur-sm min-h-[600px]">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: Upload ─────────────────── */}
            {step === 0 && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

                {faces.length === 0 ? (
                  <>
                    <button onClick={() => fileRef.current?.click()}
                      className="group flex h-64 w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 transition-all hover:border-electric/50 hover:bg-electric/5">
                      <Upload size={40} className="mb-4 text-dim group-hover:text-electric transition-colors" />
                      <p className="font-mono text-[13px] tracking-[0.1em] text-mist">DROP FACE IMAGE HERE</p>
                      <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-dim">JPG, PNG, WebP &bull; Max 10MB</p>
                    </button>
                    {loading && (
                      <div className="mt-4 flex items-center gap-2 text-amber">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="font-mono text-[11px]">Detecting faces...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="relative inline-block">
                      <img src={imageUrl!} alt="Uploaded" className="max-h-80 rounded-xl object-contain" />
                    </div>

                    <div className="mt-4 rounded-xl border border-electric/20 bg-electric/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye size={14} className="text-electric" />
                        <span className="font-mono text-[11px] tracking-[0.1em] text-electric">
                          {faces.length} FACE(S) DETECTED
                        </span>
                      </div>

                      {faces.length > 1 && (
                        <div className="mb-3">
                          <p className="font-mono text-[10px] text-dim mb-2">Select a face:</p>
                          <div className="flex gap-2">
                            {faces.map((f, i) => (
                              <button key={i} onClick={() => setSelectedFace(i)}
                                className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] transition-all ${
                                  selectedFace === i
                                    ? "border-electric bg-electric/10 text-electric"
                                    : "border-white/10 text-dim hover:border-white/20"
                                }`}>
                                Face {i}: {(f.confidence * 100).toFixed(0)}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 font-mono text-[10px] text-dim">
                        <p>Confidence: {(faces[selectedFace].confidence * 100).toFixed(1)}%</p>
                        <p>Image SHA-256: {imageHash.slice(0, 24)}...</p>
                      </div>

                      <button onClick={handleEncode} disabled={loading || !modelsReady}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-electric/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-electric transition-all hover:bg-electric/20 disabled:opacity-40">
                        {loading ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                        {loading ? "ENCODING..." : "ENCODE SELECTED FACE"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEPS 1-5: Results panel ───────── */}
            {step >= 1 && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

                {/* Encoded face summary */}
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-4">
                    {faceCropUrl ? (
                      <img src={faceCropUrl} alt="Face" className="h-16 w-16 rounded-xl object-cover ring-2 ring-electric/30" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center text-dim"><Eye size={20} /></div>
                    )}
                    <div className="flex-1">
                      <p className="font-mono text-[11px] tracking-[0.1em] text-electric">FACE ENCODED</p>
                      <p className="font-mono text-[10px] text-dim mt-1">
                        1024-d HSE descriptor &bull; Image hash: {imageHash.slice(0, 12)}...
                      </p>
                      <p className="font-mono text-[10px] text-dim">
                        Desc hash: {descHash.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Low-quality input warning */}
                {lowQualityInput && (
                  <div className="mb-4 rounded-lg border border-amber/20 bg-amber/5 p-2.5 font-mono text-[9px] leading-relaxed text-amber">
                    ⚠ Input face is small / low-resolution — similarity scores are computed conservatively.
                    A clear, front-facing photo gives the most reliable matches.
                  </div>
                )}

                {/* STEP 1: Search button */}
                {step === 1 && (
                  <div className="mb-4">
                    <button onClick={handleSearch} disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-6 py-3 font-mono text-[12px] font-bold tracking-[0.1em] text-white shadow-[0_8px_24px_-6px_rgba(52,211,153,0.5)] transition-all hover:shadow-[0_12px_32px_-6px_rgba(52,211,153,0.7)] disabled:opacity-50">
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      {loading ? "SEARCHING..." : "SEARCH FACE ON THE WEB"}
                    </button>
                    <p className="mt-2 font-mono text-[9px] text-dim/70">
                      Searches the cropped face region via Google Lens — not the full photo
                    </p>
                    {searchMode && (
                      <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] ${
                        searchMode === "live" ? "bg-electric/10 text-electric" : "bg-amber/10 text-amber"
                      }`}>
                        <Globe size={10} />
                        {searchMode === "live" ? "LIVE WEB SEARCH" : "DEMO MODE — No real search performed"}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Match results */}
                {step >= 2 && processed.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] tracking-[0.14em] text-electric">SEARCH RESULTS</p>
                      <span className="font-mono text-[10px] text-dim">{processed.length} candidates</span>
                    </div>                    {processed.slice(0, 10).map((res, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-xl border p-4 transition-all ${
                          selectedResult === res
                            ? "border-electric bg-electric/10"
                            : i === 0 && res.similarity !== null && res.similarity >= VERIFIED_FLOOR
                            ? "border-electric/30 bg-electric/5"
                            : "border-white/10 bg-white/[0.02]"
                        }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              {res.imageUrl && (
                                <img
                                  src={res.imageUrl}
                                  alt=""
                                  className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-white/5 object-cover"
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  loading="lazy"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <a href={res.url} target="_blank" rel="noopener noreferrer"
                                  className="block truncate font-mono text-[11px] font-medium text-bone transition-colors hover:text-electric">
                                  {res.title}
                                </a>
                                <p className="mt-1 font-mono text-[10px] text-dim">
                                  <Globe size={9} className="mr-1 inline" />
                                  {res.domain}
                                </p>
                              </div>
                            </div>
                            {res.snippet && (
                              <p className="font-mono text-[9px] text-dim/70 mt-1 line-clamp-2">{res.snippet}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="font-mono text-[9px] text-dim">
                                {res.imageDownloaded ? "✓ Image loaded" : "✗ Image unavailable"}
                              </span>
                              <span className="font-mono text-[9px] text-dim">
                                {res.faceInResult ? "✓ Face detected" : "— No face in result"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {res.similarity !== null ? (
                              <>
                                <p className="font-mono text-lg font-bold" style={{
                                  color: res.similarity >= MATCH_BANDS.VERY_HIGH ? "#34d399"
                                    : res.similarity >= MATCH_BANDS.HIGH ? "#2dd4bf"
                                    : res.similarity >= MATCH_BANDS.POSSIBLE ? "#f59e0b"
                                    : "#ef4444"
                                }}>
                                  {(res.similarity * 100).toFixed(1)}%
                                </p>
                                <p className="font-mono text-[8px] text-dim uppercase">{res.matchLabel}</p>
                                {res.distance !== null && (
                                  <p className="font-mono text-[8px] text-dim">d={res.distance.toFixed(2)}</p>
                                )}
                              </>
                            ) : (
                              <p className="font-mono text-[10px] text-dim">N/A</p>
                            )}
                          </div>
                        </div>
                        {step === 2 && (
                          <button onClick={() => handleSelect(res)}
                            className="mt-3 flex items-center gap-2 rounded-lg bg-electric/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-electric transition-all hover:bg-electric/20">
                            <Zap size={11} />
                            {selectedResult === res ? "SELECTED" : "SELECT & CREATE EVIDENCE"}
                          </button>
                        )}
                      </motion.div>
                    ))}

                    <p className="pt-1 font-mono text-[9px] leading-relaxed text-dim/60">
                      Similarity compares 1024-d HSE face descriptors (upscaled crops) using @vladmandic/human&apos;s
                      calibrated metric, where &gt;0.5 indicates a match. Only ≥{Math.round(MATCH_BANDS.VERY_HIGH * 100)}% is
                      treated as a near-certain same-person match; ≥{Math.round(MATCH_BANDS.HIGH * 100)}% is a high visual
                      match; 50–{Math.round(MATCH_BANDS.HIGH * 100) - 1}% is a possible match and must not be treated as
                      identity confirmation. A visual match should never be treated as proof of a person&apos;s
                      real-world identity unless the public source itself provides identifying context.
                    </p>
                  </div>
                )}

                {/* STEP 3: Evidence */}
                {step >= 3 && evidence && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border border-violet/20 bg-violet/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Fingerprint size={14} className="text-violet" />
                      <p className="font-mono text-[11px] tracking-[0.1em] text-violet">EVIDENCE PACKAGE</p>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-dim">
                      <p>Evidence ID: TF-{evidence.caseId.slice(0, 8).toUpperCase()}</p>
                      <p>Created: {evidence.createdAt}</p>
                      <p>Result: {evidence.resultTitle.slice(0, 40)}</p>
                      <p>Similarity: {(evidence.similarityScore * 100).toFixed(1)}%</p>
                    </div>
                    <div className="mt-2 rounded-lg bg-void/60 p-2 font-mono text-[10px] text-electric/80 break-all">
                      {evidenceHash}
                    </div>
                    {step === 3 && (
                      <button onClick={handleBlockchain} disabled={loading}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-amber/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-amber transition-all hover:bg-amber/20 disabled:opacity-40">
                        {loading ? <Loader2 size={11} className="animate-spin" /> : <Link size={11} />}
                        {loading ? "SUBMITTING..." : "UPLOAD TO BLOCKCHAIN"}
                      </button>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: Blockchain receipt */}
                {step >= 4 && bcReceipt && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border border-amber/20 bg-amber/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} className="text-amber" />
                      <p className="font-mono text-[11px] tracking-[0.1em] text-amber">BLOCKCHAIN REGISTERED</p>
                      {bcReceipt.mode === "demo" && (
                        <span className="rounded-full bg-amber/20 px-2 py-0.5 font-mono text-[8px] text-amber">DEMO</span>
                      )}
                    </div>
                    <div className="space-y-1 font-mono text-[10px] text-dim">
                      <p>Network: {bcReceipt.networkName}</p>
                      <p>Block: #{bcReceipt.blockNumber}</p>
                      <p>TX: {bcReceipt.txHash.slice(0, 24)}...</p>
                      <p>Status: {bcReceipt.status === "confirmed" ? "Confirmed" : "Pending"}</p>
                      {bcReceipt.explorerUrl && (
                        <p>
                          <a href={`${bcReceipt.explorerUrl}/tx/${bcReceipt.txHash}`} target="_blank" rel="noopener noreferrer"
                            className="text-electric underline">View on Explorer →</a>
                        </p>
                      )}
                    </div>
                    {step === 4 && (
                      <button onClick={handleVerify} disabled={loading}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-electric/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-electric transition-all hover:bg-electric/20 disabled:opacity-40">
                        {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                        {loading ? "VERIFYING..." : "RE-VERIFY EVIDENCE"}
                      </button>
                    )}
                  </motion.div>
                )}

                {/* STEP 5: Verification */}
                {step >= 5 && verified !== null && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`mt-4 rounded-xl border p-4 ${
                      verified ? "border-electric/30 bg-electric/5" : "border-danger/30 bg-danger/5"
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className={verified ? "text-electric" : "text-danger"} />
                      <p className={`font-mono text-[11px] tracking-[0.1em] ${verified ? "text-electric" : "text-danger"}`}>
                        {verified ? "VERIFIED" : "VERIFICATION FAILED"}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] text-mist">
                      {verified
                        ? "Evidence hash matches the blockchain record. Data integrity confirmed."
                        : "Evidence hash does NOT match the blockchain record."}
                    </p>
                    <p className="font-mono text-[10px] text-dim mt-1">
                      Hash: {verifyHash.slice(0, 32)}...
                    </p>

                    <button onClick={handleTamper}
                      className="mt-3 flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.1em] text-danger transition-all hover:bg-danger/20">
                      <AlertTriangle size={11} />
                      SIMULATE TAMPERING
                    </button>
                  </motion.div>
                )}

                {/* Tamper result */}
                {tamperResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
                    <p className="font-mono text-[11px] tracking-[0.1em] text-danger mb-2">TAMPERING DEMONSTRATION</p>
                    <div className="space-y-2">
                      <div>
                        <p className="font-mono text-[9px] text-dim">ORIGINAL HASH:</p>
                        <p className="font-mono text-[10px] text-electric break-all">{tamperResult.orig}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-dim">TAMPERED HASH ({tamperResult.field}):</p>
                        <p className="font-mono text-[10px] text-danger break-all">{tamperResult.tampered}</p>
                      </div>
                      <div className={`rounded-lg p-2 font-mono text-[10px] ${
                        tamperResult.fail ? "bg-danger/10 text-danger" : "bg-amber/10 text-amber"
                      }`}>
                        {tamperResult.fail
                          ? "BLOCKCHAIN VERIFICATION FAILED — Hash mismatch proves tampering"
                          : "Hashes match (unexpected)"}
                      </div>
                      <p className="font-mono text-[9px] text-dim leading-relaxed">
                        Even a small modification changes the cryptographic fingerprint, causing blockchain verification to fail.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live Log */}
        <div className="rounded-3xl border border-white/10 bg-[#0a1610]/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-electric animate-pulse" />
            <p className="font-mono text-[11px] tracking-[0.14em] text-electric">PIPELINE LOG</p>
          </div>

          <div className="h-[500px] overflow-y-auto space-y-1.5 no-scrollbar">
            {logs.length === 0 ? (
              <p className="font-mono text-[11px] text-dim mt-8 text-center">
                Upload an image to start the investigation...
              </p>
            ) : (
              logs.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`font-mono text-[10.5px] leading-relaxed ${
                    l.includes("ERROR") || l.includes("FAILED") || l.includes("error") || l.includes("✗")
                      ? "text-danger/80" : l.includes("VERIFIED") || l.includes("✓") || l.includes("Confirmed")
                      ? "text-electric/80" : l.includes("⚠")
                      ? "text-amber/80" : "text-mist/70"
                  }`}>
                  {l}
                </motion.div>
              ))
            )}
          </div>

          {/* Task Requirements Checklist */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <p className="font-mono text-[10px] tracking-[0.12em] text-electric mb-2">TASK REQUIREMENTS</p>
            {[
              ["Face detection", step >= 1 && faces.length > 0],
              ["Face encoding", step >= 1 && descriptor.length > 0],
              ["Web/social search", step >= 2 && rawResults.length > 0],
              ["Public result discovered", step >= 2 && processed.length > 0],
              ["Face similarity comparison", step >= 2 && processed.some((r) => r.similarity !== null)],
              ["Evidence fingerprint", step >= 3 && evidence !== null],
              ["Blockchain record", step >= 4 && bcReceipt !== null],
              ["Evidence re-verified", step >= 5 && verified === true],
              ["Tampering detection", tamperResult !== null && tamperResult.fail],
            ].map(([label, done]) => (
              <p key={label as string} className={`font-mono text-[10px] ${done ? "text-mist" : "text-dim/50"}`}>
                {done ? "✅" : "⬜"} {label}
              </p>
            ))}
          </div>

          {/* Search mode badge */}
          {searchMode && (
            <div className={`mt-3 rounded-lg p-2 font-mono text-[10px] ${
              searchMode === "live" ? "bg-electric/5 text-electric" : "bg-amber/5 text-amber"
            }`}>
              {searchMode === "live"
                ? `🟢 Live search — ${searchProvider}`
                : "🟡 Demo mode — No real search performed"}
            </div>
          )}

          {/* Blockchain mode badge */}
          {bcMode && (
            <div className={`mt-2 rounded-lg p-2 font-mono text-[10px] ${
              bcMode === "demo" ? "bg-amber/5 text-amber" : "bg-electric/5 text-electric"
            }`}>
              {bcMode === "demo"
                ? "🟡 Blockchain: Local Demonstration Chain"
                : "🟢 Blockchain: Public Testnet"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
