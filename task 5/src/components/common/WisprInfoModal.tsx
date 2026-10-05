import React from 'react';
import { X, Mic, ExternalLink, Sparkles } from 'lucide-react';

interface WisprInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WisprInfoModal: React.FC<WisprInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-2xl bg-studio-card dark:bg-studio-darkCard border border-studio-border dark:border-studio-darkBorder shadow-warm-lg text-studio-text dark:text-studio-darkText relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-studio-textSec hover:text-studio-maroon dark:hover:text-studio-gold hover:bg-studio-bgSec dark:hover:bg-studio-darkSec transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-studio-maroon/10 dark:bg-studio-gold/15 text-studio-maroon dark:text-studio-gold">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold">Voice-First Architecture</h3>
            <span className="text-[11px] font-mono tracking-wider text-studio-gold uppercase">Powered by Wispr Flow</span>
          </div>
        </div>

        <p className="text-xs text-studio-textSec dark:text-studio-textSec leading-relaxed mt-2">
          VoxForge uses <b>Wispr Flow</b> as its voice-driven input layer. Speak naturally into the focused command field and Flow inserts your polished transcription. VoxForge then interprets that command and routes it to the appropriate workspace.
        </p>

        <div className="mt-4 p-3.5 rounded-xl bg-studio-bg dark:bg-studio-darkBg border border-studio-border dark:border-studio-darkBorder text-xs space-y-2">
          <div className="flex items-center gap-2 text-studio-maroon dark:text-studio-gold font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How to Demonstrate:</span>
          </div>
          <ol className="list-decimal list-inside text-studio-textSec space-y-1 text-[11px]">
            <li>Open the Wispr Flow desktop app.</li>
            <li>Click or focus VoxForge's top command bar.</li>
            <li>Press your Wispr Flow trigger key and dictate your prompt.</li>
            <li>Hit Enter or click Execute to watch the workspace build.</li>
          </ol>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-studio-maroon hover:bg-studio-maroonHover text-white text-xs font-semibold shadow-warm-sm transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
