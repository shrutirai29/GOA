import React from 'react';
import { ProcessingStep } from '../../types';
import { Mic, Cpu, Hammer, Check } from 'lucide-react';

interface LoadingScanProps {
  step: ProcessingStep;
  intentLabel?: string;
}

export const LoadingScan: React.FC<LoadingScanProps> = ({ step, intentLabel }) => {
  if (step === 'idle') return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none rounded-2xl overflow-hidden bg-studio-bg/60 dark:bg-studio-darkBg/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
      {/* Horizontal laser scan beam */}
      <div className="laser-scan-line" />

      {/* Center status pill */}
      <div className="px-5 py-2.5 rounded-full bg-studio-card/95 dark:bg-studio-darkCard/95 border border-studio-maroon/30 dark:border-studio-gold/30 shadow-warm-lg flex items-center gap-3 text-xs font-mono font-semibold text-studio-maroon dark:text-studio-gold animate-pulse">
        {step === 'received' && (
          <>
            <Mic className="w-3.5 h-3.5 text-studio-maroon animate-bounce" />
            <span>VOICE RECEIVED</span>
          </>
        )}
        {step === 'understanding' && (
          <>
            <Cpu className="w-3.5 h-3.5 text-studio-gold animate-spin" />
            <span>UNDERSTANDING COMMAND</span>
          </>
        )}
        {step === 'building' && (
          <>
            <Hammer className="w-3.5 h-3.5 text-studio-teal animate-pulse" />
            <span>BUILDING EXPERIENCE</span>
          </>
        )}
        {step === 'ready' && (
          <>
            <Check className="w-3.5 h-3.5 text-studio-success" />
            <span className="text-studio-success">READY</span>
          </>
        )}
      </div>
    </div>
  );
};
