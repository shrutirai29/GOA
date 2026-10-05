import React, { useState } from 'react';
import { VoiceActivityItem } from '../../types';
import { History, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface VoiceActivityProps {
  activity: VoiceActivityItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceActivity: React.FC<VoiceActivityProps> = ({ activity, isOpen, onClose }) => {
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (!isOpen) return null;

  const latestItem = activity[0];

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl p-4 bg-[#FCF8F2] dark:bg-[#1E1619] border border-[rgba(181,138,82,0.25)] shadow-[0_12px_40px_rgba(84,28,45,0.15)] animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(181,138,82,0.18)] mb-3">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-studio-maroon dark:text-studio-gold" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-studio-text dark:text-studio-darkText uppercase">
            Voice Activity
          </h4>
          <span className="w-1.5 h-1.5 rounded-full bg-studio-success animate-pulse" />
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-studio-textSec hover:text-studio-maroon transition"
          aria-label="Close activity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!showFullHistory ? (
        /* Single Recent Event per specification */
        <div className="space-y-3 text-xs">
          {!latestItem ? (
            <div className="py-4 text-center text-studio-textSec text-[11px]">
              <Sparkles className="w-4 h-4 mx-auto mb-1.5 opacity-50 text-studio-gold" />
              No spoken commands recorded yet.
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-[rgba(84,28,45,0.06)] space-y-2">
                <div>
                  <div className="text-[10px] font-mono text-studio-textSec uppercase">You said:</div>
                  <div className="font-serif italic text-sm text-studio-maroon dark:text-studio-gold mt-0.5">
                    "{latestItem.rawText}"
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] font-mono border-t border-[rgba(84,28,45,0.06)]">
                  <div>
                    <span className="text-studio-textSec">Intent: </span>
                    <span className="font-semibold text-studio-text dark:text-studio-darkText">
                      {latestItem.intentLabel}
                    </span>
                  </div>
                  <div className="text-studio-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ready</span>
                  </div>
                </div>
              </div>

              {activity.length > 1 && (
                <button
                  onClick={() => setShowFullHistory(true)}
                  className="w-full py-1.5 text-center text-[11px] font-mono text-studio-textSec hover:text-studio-maroon transition"
                >
                  View full history ({activity.length} commands) →
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        /* Full History View */
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-studio-textSec">
            <span>Command History</span>
            <button
              onClick={() => setShowFullHistory(false)}
              className="text-studio-maroon hover:underline"
            >
              ← Back
            </button>
          </div>
          {activity.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] text-[11px] space-y-1"
            >
              <div className="flex justify-between text-[10px] font-mono text-studio-textSec">
                <span>{item.timestamp}</span>
                <span className="text-studio-gold font-semibold">{item.intentLabel}</span>
              </div>
              <div className="font-serif italic text-studio-text dark:text-studio-darkText">
                "{item.rawText}"
              </div>
              <div className="text-[10px] text-studio-success font-semibold">
                ✓ {item.resultTitle} ready
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
