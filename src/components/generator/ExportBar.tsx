"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2, Sparkles } from "lucide-react";
import { exportCardNode, exportFilename } from "@/lib/exportCard";
import { buildShareCaption, copyCaption, openXIntent } from "@/lib/share";

interface ExportBarProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  generated: boolean;
  format: "id" | "pfp";
  name: string;
  title: string;
  stack: string;
  handle: string;
  onToast: (msg: string) => void;
  onGenerate: () => void;
  generating: boolean;
}

export function ExportBar({
  cardRef,
  generated,
  format,
  name,
  title,
  stack,
  handle,
  onToast,
  onGenerate,
  generating,
}: ExportBarProps) {
  const [busy, setBusy] = useState<null | "png" | "jpg">(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (type: "png" | "jpg") => {
    const node = cardRef.current;
    if (!node) return;
    setBusy(type);
    try {
      const dataUrl = await exportCardNode(node);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = exportFilename(format, name);
      document.body.appendChild(a);
      a.click();
      a.remove();
      onToast(type === "png" ? "PNG SAVED — NOW SHARE IT" : "JPEG SAVED");
    } catch {
      onToast("EXPORT FAILED. TRY AGAIN.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = () => {
    const caption = buildShareCaption({ name, title, stack, handle });
    openXIntent(caption);
    onToast("X COMPOSE OPENED — ATTACH YOUR IMAGE");
  };

  const handleCopy = async () => {
    const ok = await copyCaption(buildShareCaption({ name, title, stack, handle }));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      onToast("CAPTION COPIED");
    }
  };

  if (!generated) {
    return (
      <div className="mt-8 flex justify-center">
        <motion.button
          onClick={onGenerate}
          disabled={generating}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#4ade80] via-[#34d399] to-[#2dd4bf] px-10 py-4 font-mono text-[13px] font-bold tracking-[0.2em] text-white shadow-[0_12px_40px_-10px_rgba(52,211,153,0.9)] transition-shadow hover:shadow-[0_16px_50px_-10px_rgba(45,212,191,0.9)]"
          data-cursor="view"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          GENERATE MY ID
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <button
          onClick={() => handleDownload("png")}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#22c55e] to-[#2dd4bf] px-7 py-3.5 font-mono text-[12px] font-bold tracking-[0.16em] text-white shadow-[0_10px_32px_-8px_rgba(52,211,153,0.85)] transition-all hover:shadow-[0_14px_42px_-8px_rgba(52,211,153,1)] disabled:opacity-60"
        >
          {busy === "png" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          DOWNLOAD PNG
        </button>
        <button
          onClick={() => handleDownload("jpg")}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/35 bg-white/[0.12] px-6 py-3.5 font-mono text-[12px] font-bold tracking-[0.16em] text-bone transition-colors hover:border-white/60 hover:bg-white/[0.18] disabled:opacity-60"
        >
          {busy === "jpg" ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          JPEG
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-neon/70 bg-[#0e2418] px-7 py-3.5 font-mono text-[12px] font-bold tracking-[0.16em] text-white shadow-[0_10px_32px_-8px_rgba(245,197,66,0.45)] transition-all hover:border-neon hover:bg-[#123021]"
        >
          <Share2 size={15} className="text-neon" />
          SHARE TO X
        </button>
      </div>
      <button
        onClick={handleCopy}
        className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-white/25 bg-[#0e2418] px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] text-bone transition-colors hover:border-white/50"
      >
        {copied ? <Check size={13} className="text-tropic" /> : <Copy size={13} className="text-electric" />}
        {copied ? "CAPTION COPIED" : "COPY SHARE CAPTION"}
      </button>
      <p className="mt-3 text-center font-mono text-[10.5px] font-medium tracking-[0.12em] text-mist">
        #FrameInGoa · #HHGoa2026 — ATTACH THE DOWNLOADED IMAGE IN THE COMPOSE WINDOW
      </p>
    </motion.div>
  );
}
