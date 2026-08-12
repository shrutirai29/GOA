"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, RefreshCw } from "lucide-react";
import { SUPPORTED_HINTS } from "@/lib/imageProcessor";

interface UploadZoneProps {
  onFile: (file: File) => void;
  processing: boolean;
  hasPhoto: boolean;
}

export function UploadZone({ onFile, processing, hasPhoto }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = () => {
    if (processing) return;
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (processing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        aria-label="Upload your photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />

      <motion.button
        type="button"
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileTap={{ scale: 0.99 }}
        data-cursor="drop"
        aria-label="Upload your photo — drag and drop or tap to choose"
        className={`group relative block w-full overflow-hidden rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-300 ${
          dragging
            ? "border-electric bg-electric/15"
            : "border-white/40 bg-white/[0.15] hover:border-electric/70 hover:bg-electric/[0.16]"
        }`}
      >
        {/* animated glow on drag */}
        {dragging && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 50% 50%, rgba(52,211,153,0.18) 0%, transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        <div className="relative flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            {processing ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="grid h-16 w-16 place-items-center"
              >
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-electric" style={{ animationDuration: "0.9s" }} />
                  <div className="absolute inset-[6px] animate-spin rounded-full border-2 border-transparent border-b-neon" style={{ animationDuration: "1.4s", animationDirection: "reverse" }} />
                  <div className="absolute inset-[12px] rounded-full bg-electric/30 blur-[6px]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-electric/25 to-neon/15"
              >
                <ImagePlus size={26} className="text-electric" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-neon shadow-[0_0_10px_rgba(245,197,66,0.9)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {processing ? (
            <p className="font-mono text-[13px] font-bold tracking-[0.24em] text-electric">
              CALIBRATING IDENTITY...
            </p>
          ) : (
            <>
              <p className="font-display text-2xl uppercase tracking-wide text-bone sm:text-3xl">
                {dragging ? "Release to upload" : "Drop your photo"}
              </p>
              <p className="font-mono text-[12px] font-bold tracking-[0.16em] text-mist">
                or tap to upload
              </p>
            </>
          )}

          <p className="mt-1 font-mono text-[10px] font-medium tracking-[0.2em] text-dim">
            {SUPPORTED_HINTS} · MAX 25 MB · PROCESSED IN YOUR BROWSER
          </p>
        </div>

        {/* bottom accent line */}
        <span className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-electric to-neon transition-all duration-500 group-hover:w-2/3" />
      </motion.button>

      {/* replace strip */}
      <AnimatePresence>
        {hasPhoto && !processing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/30 bg-[#0e2418] px-4 py-3">
              <span className="font-mono text-[11px] tracking-[0.18em] text-tropic">
                ● PHOTO LOADED
              </span>
              <button
                onClick={pick}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-mist transition-colors hover:border-electric hover:text-bone"
              >
                <RefreshCw size={13} /> REPLACE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
