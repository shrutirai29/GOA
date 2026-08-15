"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { processPhoto, type PhotoError } from "@/lib/imageProcessor";
import { defaultCrop } from "@/lib/photoTransform";
import { generateTitle, nextTitle } from "@/lib/titleGenerator";
import { cropFromPx, cropToPx } from "@/lib/photoTransform";
import type { Crop, FormatId, StyleId } from "@/lib/cardStyles";
import { UploadZone } from "./UploadZone";
import { CropControls } from "./CropControls";
import { BuilderForm } from "./BuilderForm";
import { StyleSelector, FormatToggle } from "./StyleSelector";
import { CardPreview } from "./CardPreview";
import { ExportBar } from "./ExportBar";

interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "error";
}

export function Generator() {
  const [photo, setPhoto] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [crop, setCrop] = useState<Crop>({ scale: 1, x: 0, y: 0, rotate: 0 });
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [title, setTitle] = useState("THE BUILDER");
  const [titleLocked, setTitleLocked] = useState(false);
  const [handle, setHandle] = useState("");
  const [superpower, setSuperpower] = useState("");
  const [style, setStyle] = useState<StyleId>("tropic");
  const [format, setFormat] = useState<FormatId>("id");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const toastId = useRef(0);

  const toast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  /* ---------- upload ---------- */

  const handleFile = useCallback(
    async (file: File) => {
      setProcessing(true);
      try {
        const img = await processPhoto(file);
        setPhoto(img);
        setCrop(defaultCrop(img.width, img.height));
        setGenerated(false);
      } catch (err) {
        const e = err as PhotoError;
        toast(e.message ?? "That photo couldn't be processed. Try a JPG or PNG.", "error");
      } finally {
        setProcessing(false);
      }
    },
    [toast],
  );

  /* ---------- crop ---------- */

  const updateCrop = (next: Crop) => setCrop(next);

  const handlePhotoDrag = useCallback((dx: number, dy: number, slotW: number, slotH: number) => {
    setCrop((c) => {
      const px = cropToPx(c, slotW, slotH);
      return cropFromPx({ ...px, x: px.x + dx, y: px.y + dy }, slotW, slotH);
    });
  }, []);

  const resetCrop = () => {
    if (!photo) return;
    setCrop(defaultCrop(photo.width, photo.height));
  };

  /* ---------- form ---------- */

  const handleStack = (v: string) => {
    setStack(v);
    if (!titleLocked) {
      setTitle(generateTitle(v));
    }
  };

  const regenerateTitle = () => {
    setTitle(nextTitle(stack, title));
  };

  /* ---------- generate ---------- */

  const runGeneration = useCallback(() => {
    if (!photo) {
      toast("UPLOAD A PHOTO FIRST — THEN FORGE YOUR ID.", "error");
      document.querySelector("#generator")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      toast("IDENTITY GENERATED ✦");
    }, 1150);
  }, [photo, toast]);

  return (
    <section id="generator" className="relative isolate mx-auto max-w-6xl scroll-mt-24 px-4 pb-28 pt-24 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(65% 100% at 50% 0%, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0) 70%)",
        }}
      />
      {/* heading */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] tracking-[0.34em] text-electric"
        >
          THE GENERATOR
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-3 font-display text-[clamp(2.4rem,7vw,4.5rem)] uppercase leading-[0.95] tracking-wide"
        >
          Forge your <span className="text-gradient-brand">identity</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mx-auto mt-4 max-w-md font-mono text-[12px] font-medium tracking-[0.08em] text-mist"
        >
          UPLOAD → CUSTOMIZE → GENERATE → SHARE. UNDER A MINUTE, NO ACCOUNT.
        </motion.p>
      </div>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* ---------- preview (first on mobile) ---------- */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-24">
            <CardPreview
              exportRef={cardRef}
              photo={photo}
              crop={crop}
              name={name}
              stack={stack}
              title={title}
              format={format}
              style={style}
              generating={generating}
              generated={generated}
              onPhotoDrag={handlePhotoDrag}
            />
            <ExportBar
              cardRef={cardRef}
              generated={generated}
              generating={generating}
              format={format}
              name={name}
              title={title}
              stack={stack}
              handle={handle}
              onGenerate={runGeneration}
              onToast={toast}
            />
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div className="order-2 space-y-5 lg:order-1">
          <UploadZone onFile={handleFile} processing={processing} hasPhoto={Boolean(photo)} />

          <CropControls crop={crop} onChange={updateCrop} onReset={resetCrop} hasPhoto={Boolean(photo)} />

          <BuilderForm
            name={name}
            stack={stack}
            title={title}
            handle={handle}
            superpower={superpower}
            titleLocked={titleLocked}
            onName={setName}
            onStack={handleStack}
            onTitle={setTitle}
            onHandle={setHandle}
            onSuperpower={setSuperpower}
            onTitleLock={() => setTitleLocked(true)}
            onRegenerateTitle={regenerateTitle}
          />

          <FormatToggle format={format} onFormat={(f) => setFormat(f)} />

          <StyleSelector style={style} onStyle={(s) => setStyle(s)} />

          {/* privacy note */}
          <div className="flex items-start gap-3 rounded-2xl border border-white/30 bg-[#0e2418] p-4">
            <Info size={15} className="mt-0.5 shrink-0 text-cyan" />
            <p className="font-mono text-[11px] font-medium leading-relaxed tracking-[0.08em] text-mist">
              YOUR PHOTO IS PROCESSED 100% IN YOUR BROWSER. NOTHING IS UPLOADED OR STORED
              ANYWHERE.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass flex items-center gap-2.5 rounded-full px-5 py-3 font-mono text-[11px] font-bold tracking-[0.16em]"
            >
              {t.kind === "ok" ? (
                <CheckCircle2 size={14} className="text-tropic" />
              ) : (
                <Info size={14} className="text-sunset" />
              )}
              <span style={{ color: t.kind === "ok" ? "#e9e4ff" : "#ffd9b0" }}>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
