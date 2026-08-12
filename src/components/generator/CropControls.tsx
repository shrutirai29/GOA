"use client";

import { Move, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { Crop } from "@/lib/cardStyles";

interface CropControlsProps {
  crop: Crop;
  onChange: (crop: Crop) => void;
  onReset: () => void;
  hasPhoto: boolean;
}

export function CropControls({ crop, onChange, onReset, hasPhoto }: CropControlsProps) {
  if (!hasPhoto) return null;

  return (
    <div className="rounded-3xl border border-white/30 bg-[#0e2418] p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.22em] text-electric">
          <SlidersHorizontal size={14} className="text-electric" />
          PHOTO FIT
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-dim transition-colors hover:text-bone"
        >
          <RotateCcw size={12} /> RESET
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="crop-zoom" className="font-mono text-[11px] font-bold tracking-[0.16em] text-mist">
              ZOOM
            </label>
            <span className="font-mono text-[11px] text-electric">{crop.scale.toFixed(2)}×</span>
          </div>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={2.5}
            step={0.01}
            value={Math.min(2.5, Math.max(1, crop.scale))}
            onChange={(e) => onChange({ ...crop, scale: Number(e.target.value) })}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="crop-rotate" className="font-mono text-[11px] font-bold tracking-[0.16em] text-mist">
              ROTATE
            </label>
            <span className="font-mono text-[11px] text-electric">{crop.rotate}°</span>
          </div>
          <input
            id="crop-rotate"
            type="range"
            min={-30}
            max={30}
            step={1}
            value={crop.rotate}
            onChange={(e) => onChange({ ...crop, rotate: Number(e.target.value) })}
          />
        </div>
      </div>

      <p className="mt-5 flex items-center gap-2 border-t border-white/20 pt-4 font-mono text-[11px] font-medium tracking-[0.14em] text-mist">
        <Move size={12} className="text-neon" />
        DRAG THE PHOTO ON THE CARD TO REPOSITION IT
      </p>
    </div>
  );
}
