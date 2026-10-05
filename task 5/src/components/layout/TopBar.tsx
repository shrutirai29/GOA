import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Sun, Moon, Volume2, History } from 'lucide-react';
import { ProcessingStep } from '../../types';
import { ROTATING_SUGGESTIONS } from '../../data/presets';

interface TopBarProps {
  commandText: string;
  setCommandText: (text: string) => void;
  onExecute: () => void;
  processingStep: ProcessingStep;
  currentIntentLabel?: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onReadAloud?: () => void;
  onToggleActivity: () => void;
  isActivityOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  commandText,
  setCommandText,
  onExecute,
  processingStep,
  currentIntentLabel,
  theme,
  toggleTheme,
  onReadAloud,
  onToggleActivity,
  isActivityOpen
}) => {
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % ROTATING_SUGGESTIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onExecute();
    }
  };

  return (
    <header className="mt-2.5 mx-3 sm:mx-4 mb-2 h-16 shrink-0 rounded-2xl border border-[rgba(84,28,45,0.12)] dark:border-[rgba(235,220,203,0.14)] bg-[rgba(247,240,230,0.40)] dark:bg-[rgba(25,18,21,0.60)] backdrop-blur-md px-5 flex items-center justify-between gap-4 transition-all z-30 shadow-sm">
        
        {/* Left: Brand */}
        <div className="shrink-0 flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-wide text-studio-maroon dark:text-[#FDE047]">
                VOXFORGE
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[rgba(84,28,45,0.07)] dark:bg-yellow-400/20 text-studio-maroon dark:text-[#FDE047] font-bold">
                STUDIO 01
              </span>
            </div>
            <p className="text-[11px] text-studio-textSec dark:text-white/85 font-sans tracking-tight">
              Build. Plan. Code. Think. Play.
            </p>
          </div>
        </div>

        {/* Center: Hero Command Bar */}
        <div className="flex-1 max-w-2xl py-0.5">
          <div className="relative flex items-center rounded-2xl bg-[rgba(247,240,230,0.55)] dark:bg-[rgba(35,25,28,0.7)] backdrop-blur-sm border border-[rgba(84,28,45,0.18)] dark:border-white/25 shadow-[0_2px_10px_rgba(84,28,45,0.04)] focus-within:border-studio-maroon dark:focus-within:border-yellow-400 focus-within:bg-[rgba(247,240,230,0.85)] transition-all">
            <div className="pl-4 pr-2 text-studio-gold dark:text-[#FDE047]">
              <Sparkles className="w-4 h-4 opacity-90" />
            </div>

            <input
              type="text"
              id="voxforge-command-input"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Speak with Wispr Flow... e.g. "${ROTATING_SUGGESTIONS[suggestionIdx]}"`}
              className="w-full py-2 bg-transparent text-sm text-studio-text dark:text-white placeholder-studio-textSec/50 dark:placeholder-white/40 focus:outline-none"
              autoComplete="off"
            />

            <div className="pr-2">
              <button
                onClick={onExecute}
                disabled={processingStep !== 'idle'}
                className="px-4 py-1.5 rounded-xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm active:scale-95"
              >
                <span>{processingStep === 'idle' ? 'Execute' : 'Building'}</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sub-label under command bar */}
          <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-mono text-studio-textSec dark:text-white/70">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-success animate-pulse" />
              <span className="text-studio-success font-semibold">VOICE READY</span>
              <span>·</span>
              <span>Designed for Wispr Flow</span>
            </div>

            {processingStep !== 'idle' ? (
              <span className="text-studio-maroon dark:text-[#FDE047] font-semibold animate-pulse">
                {processingStep === 'received' && '◌ VOICE RECEIVED...'}
                {processingStep === 'understanding' && '✦ UNDERSTANDING COMMAND...'}
                {processingStep === 'building' && '⚡ BUILDING EXPERIENCE...'}
                {processingStep === 'ready' && '✓ READY'}
              </span>
            ) : (
              <span className="hidden sm:inline text-studio-textSec/60 dark:text-white/50">Press ⏎ Enter to build</span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Read Aloud */}
          {onReadAloud && (
            <button
              onClick={onReadAloud}
              className="p-2 rounded-xl text-studio-textSec hover:text-studio-maroon dark:hover:text-studio-gold hover:bg-studio-card/80 transition"
              title="Read Aloud"
              aria-label="Read Aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-studio-textSec hover:text-studio-maroon dark:hover:text-studio-gold hover:bg-studio-card/80 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-studio-gold" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Voice Activity Toggle */}
          <button
            onClick={onToggleActivity}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition ${
              isActivityOpen
                ? 'bg-studio-maroon text-white border-studio-maroon'
                : 'bg-studio-card/80 border-[rgba(84,28,45,0.1)] text-studio-textSec hover:text-studio-maroon'
            }`}
            title="Toggle Voice Activity Timeline"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Activity</span>
          </button>
        </div>
    </header>
  );
};
