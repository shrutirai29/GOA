"use client";

/**
 * Model A/B calibration component.
 *
 * Runs the REAL pipeline on the sample screenshot and prints, for every
 * candidate returned by live web search, the similarity under the OLD
 * model (face-api.js FaceNet) and the NEW model (@vladmandic/human HSE
 * FaceRes). Used to prove the new model eliminates false positives and to
 * calibrate the match thresholds.
 */

import { useEffect, useState } from "react";

import {
  loadFaceModels,
  detectFaces,
  encodeFaceUpscaled,
  faceMatchScore,
  cropFace,
} from "@/lib/face-detect";
import {
  loadLegacyModels,
  detectFacesLegacy,
  encodeFaceUpscaledLegacy,
  cosineSimilarity as legacyCosine,
} from "@/lib/face-api-legacy";
import { compressImageForSearch } from "@/lib/utils";

interface Row {
  title: string;
  url: string;
  domain: string;
  imageUrl: string;
  newCosine: number | null;
  newPct: number | null;
  newLabel: string;
  oldCosine: number | null;
}

const fmtPct = (v: number | null) =>
  v === null ? "—" : (v * 100).toFixed(1) + "%";

export function ModelTest() {
  const [log, setLog] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("Starting…");
  const [summary, setSummary] = useState<string>("");

  const push = (m: string) => setLog((p) => [...p, m]);

  const loadImg = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("load failed"));
      img.src = src;
      setTimeout(() => reject(new Error("timeout")), 6000);
    });

  useEffect(() => {
    (async () => {
      try {
        setStatus("Loading models…");
        push("Loading @vladmandic/human (HSE FaceRes, new model)…");
        await loadFaceModels();
        push("✓ human loaded");
        push("Loading legacy face-api.js (FaceNet, old model)…");
        await loadLegacyModels();
        push("✓ legacy face-api loaded");

        push("Loading sample screenshot…");
        const img = await loadImg("/samples/linkedin-screenshot.png");
        push(`Image ${img.naturalWidth}×${img.naturalHeight}`);

        // ── Query face: NEW model ──
        const facesH = await detectFaces(img);
        push(`human detected ${facesH.length} face(s)`);
        const faceH = facesH[0];
        const qH = (await encodeFaceUpscaled(img, faceH.box)) ?? faceH.descriptor;
        push(`human query embedding dim=${qH.length}`);

        // ── Query face: OLD model ── (failure here must not kill the
        // whole run — the NEW-model results are what we calibrate)
        let qL: number[] | null = null;
        try {
          const facesL = await detectFacesLegacy(img);
          push(`legacy detected ${facesL.length} face(s)`);
          const faceL = facesL[0];
          if (faceL) {
            qL = (await encodeFaceUpscaledLegacy(img, faceL.box)) ?? faceL.descriptor;
            push(`legacy query embedding dim=${qL.length}`);
          }
        } catch (e) {
          push("⚠ legacy query encode failed — skipping OLD-model comparisons: " + (e as Error).message);
        }

        // ── Live search ──
        push("Cropping face region + running LIVE web search…");
        const crop = cropFace(img, faceH.box);
        const searchImage = await compressImageForSearch(crop);
        const resp = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: searchImage }),
        });
        const data = await resp.json();
        push(`search mode=${data.mode} provider=${data.provider} total=${data.totalResults}`);
        const results = data.results || [];

        const out: Row[] = [];
        const top = results.slice(0, 12);

        for (let k = 0; k < top.length; k++) {
          const r = top[k];
          const row: Row = {
            title: r.title, url: r.url, domain: r.domain, imageUrl: r.imageUrl,
            newCosine: null, newPct: null, newLabel: "-", oldCosine: null,
          };
          push(`[${k + 1}/${top.length}] ${r.domain} — ${String(r.title).slice(0, 42)}`);
          try {
            const cImg = await loadImg(r.imageUrl);

            // NEW model comparison
            const detH = await detectFaces(cImg);
            if (detH.length > 0 && qH.length > 0) {
              let best: { cosine: number; pct: number; label: string } | null = null;
              for (const f of detH) {
                if (f.confidence < 0.3) continue;
                if (Math.min(f.box.width, f.box.height) < 40) continue;
                const cand = (await encodeFaceUpscaled(cImg, f.box)) ?? f.descriptor;
                const sc = faceMatchScore(qH, cand);
                if (sc && (!best || sc.cosine > best.cosine)) {
                  best = { cosine: sc.cosine, pct: sc.pct, label: sc.label };
                }
              }
              if (best) {
                row.newCosine = best.cosine;
                row.newPct = best.pct;
                row.newLabel = best.label;
              }
            }

            // OLD model comparison (optional — errors only blank the column)
            try {
              if (qL && qL.length > 0) {
                const detL = await detectFacesLegacy(cImg);
                if (detL.length > 0) {
                  let bestCos = -1;
                  for (const f of detL) {
                    if (f.confidence < 0.6) continue;
                    if (Math.min(f.box.width, f.box.height) < 48) continue;
                    const cand = (await encodeFaceUpscaledLegacy(cImg, f.box)) ?? f.descriptor;
                    const c = legacyCosine(qL, cand);
                    if (c > bestCos) bestCos = c;
                  }
                  row.oldCosine = bestCos < 0 ? null : bestCos;
                }
              }
            } catch {
              // legacy model unavailable — OLD column stays blank
            }
          } catch {
            // candidate not loadable
          }
          out.push(row);
          setRows([...out]);
        }

        const scored = out.filter((r) => r.newCosine !== null || r.oldCosine !== null);
        const newMax = Math.max(...scored.map((r) => r.newCosine ?? 0), 0);
        const newLabel = out.find((r) => r.newCosine === newMax)?.newLabel ?? "-";
        const oldMax = Math.max(...scored.map((r) => r.oldCosine ?? 0), 0);
        setSummary(
          `NEW model (HSE FaceRes): best cosine ${(newMax * 100).toFixed(1)}% (${newLabel}) · ` +
          `OLD model (FaceNet): best cosine ${(oldMax * 100).toFixed(1)}%`
        );
        setStatus("done");
        push("COMPLETE");
      } catch (e) {
        setStatus("ERROR: " + (e as Error).message);
        push("ERROR: " + (e as Error).message);
      }
    })();
  }, []);

  const t = { fontSize: 11, fontFamily: "ui-monospace, monospace" };
  const th = { ...t, textAlign: "left" as const, padding: "6px 8px", color: "#7ee787", borderBottom: "1px solid #21262d" };
  const td = { ...t, padding: "6px 8px", color: "#c9d1d9", borderBottom: "1px solid #161b22", verticalAlign: "top" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", padding: 24, fontFamily: "ui-monospace, monospace" }}>
      <h1 style={{ fontSize: 18, color: "#7ee787", letterSpacing: 2 }}>MODEL A/B CALIBRATION — linkedin-screenshot.png</h1>
      <p style={t}>Status: <b style={{ color: status.includes("ERROR") ? "#f85149" : "#7ee787" }}>{status}</b></p>
      {summary && <p style={{ fontSize: 12, color: "#ffa657" }}>{summary}</p>}

      <h2 style={{ fontSize: 13, color: "#7ee787", marginTop: 20 }}>PIPELINE LOG</h2>
      <pre style={{ background: "#010409", border: "1px solid #21262d", padding: 12, fontSize: 11, color: "#8b949e", whiteSpace: "pre-wrap", maxHeight: 220, overflowY: "auto" }}>
        {log.join("\n")}
      </pre>

      <h2 style={{ fontSize: 13, color: "#7ee787", marginTop: 20 }}>CANDIDATE SCORES</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 1200 }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>Candidate</th>
            <th style={th}>NEW cosine</th>
            <th style={th}>NEW sim%</th>
            <th style={th}>NEW label</th>
            <th style={th}>OLD cosine</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={td}>{i + 1}</td>
              <td style={td}>
                <div>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#58a6ff", textDecoration: "none" }}>
                    {String(r.title).slice(0, 70)}
                  </a>
                </div>
                <div style={{ color: "#8b949e", fontSize: 10 }}>{r.domain}</div>
              </td>
              <td style={{ ...td, color: (r.newCosine ?? 0) >= 0.4 ? "#3fb950" : (r.newCosine ?? 0) >= 0.3 ? "#2dd4bf" : (r.newCosine ?? 0) >= 0.2 ? "#ffa657" : "#f85149", fontWeight: "bold" }}>
                {fmtPct(r.newCosine)}
              </td>
              <td style={td}>{r.newPct !== null ? r.newPct + "%" : "—"}</td>
              <td style={{ ...td, color: r.newLabel.includes("VERY") ? "#3fb950" : r.newLabel.includes("HIGH") ? "#2dd4bf" : r.newLabel.includes("POSSIBLE") ? "#ffa657" : "#8b949e" }}>
                {r.newLabel}
              </td>
              <td style={{ ...td, color: (r.oldCosine ?? 0) >= 0.92 ? "#3fb950" : (r.oldCosine ?? 0) >= 0.88 ? "#2dd4bf" : (r.oldCosine ?? 0) >= 0.8 ? "#ffa657" : "#f85149", fontWeight: "bold" }}>
                {fmtPct(r.oldCosine)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}