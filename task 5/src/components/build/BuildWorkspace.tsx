import React, { useState } from 'react';
import { BuildItem } from '../../types';
import { VipPass } from './VipPass';
import { HolographicOrb } from './HolographicOrb';
import { GeneratedCodeModal } from './GeneratedCodeModal';
import { playClick } from '../../lib/audio';

interface BuildWorkspaceProps {
  activeBuildItem: BuildItem;
  onExecutePreset: (cmd: string) => void;
  onToast: (msg: string) => void;
  onResetToEmpty: () => void;
}

export const BuildWorkspace: React.FC<BuildWorkspaceProps> = ({
  activeBuildItem,
  onExecutePreset,
  onToast,
  onResetToEmpty
}) => {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const presetPills = [
    { id: 'vip', label: 'Cyber VIP Pass', command: 'Create a 3D cyber VIP pass with holographic effects', buildItem: 'vip_pass' },
    { id: 'orb', label: 'AI Orb', command: 'Create a holographic AI orb with 440 hertz resonance', buildItem: 'orb' },
    { id: 'prd', label: 'Create PRD', command: 'Create a PRD for a voice-controlled cybersecurity dashboard', buildItem: 'none' },
    { id: 'code', label: 'Code', command: 'Create an LRU cache in JavaScript with capacity 5', buildItem: 'none' },
    { id: 'mindmap', label: 'MindMap', command: 'Add a Security branch with authentication to the mindmap', buildItem: 'none' },
    { id: 'maze', label: 'Maze', command: 'Start the maze', buildItem: 'none' }
  ];

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Top Subtle Header & Horizontal Pill Selector */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-[rgba(84,28,45,0.06)] dark:border-[rgba(235,220,203,0.08)]">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-studio-maroon dark:text-[#FDE047]">
            Build with your voice.
          </h2>
          <p className="text-[11px] text-studio-textSec dark:text-white/90">
            Turn spoken ideas into interactive experiences.
          </p>
        </div>

        {/* Minimal Pill Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-studio-textSec dark:text-[#FDE047] font-bold mr-1">
            Examples:
          </span>
          {presetPills.map((pill) => {
            const isSelected = activeBuildItem === pill.buildItem && pill.buildItem !== 'none';
            return (
              <button
                key={pill.id}
                onClick={() => {
                  playClick();
                  onExecutePreset(pill.command);
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                  isSelected
                    ? 'bg-studio-maroon text-white dark:bg-[#7C263D] dark:text-[#FEF08A] shadow-sm font-semibold'
                    : 'bg-black/[0.03] dark:bg-white/15 text-studio-textSec dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] hover:bg-black/[0.06] dark:hover:bg-white/25 border border-[rgba(84,28,45,0.08)] dark:border-white/30 font-medium'
                }`}
              >
                {pill.label}
              </button>
            );
          })}

          {activeBuildItem !== 'none' && (
            <button
              onClick={() => {
                playClick();
                onResetToEmpty();
              }}
              className="text-[11px] font-mono text-studio-textSec dark:text-[#FDE047] hover:text-studio-maroon dark:hover:text-white ml-1.5 underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Single Experience Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeBuildItem === 'none' ? (
          /* Clean Empty State per specification */
          <div className="py-12 px-6 max-w-xl mx-auto text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(124,38,61,0.12)] dark:bg-yellow-400/20 text-studio-maroon dark:text-[#FDE047] mx-auto flex items-center justify-center text-2xl font-black shadow-md border border-[rgba(84,28,45,0.15)] dark:border-yellow-400/30">
              ✦
            </div>

            <div>
              <h3 className="font-serif text-3xl sm:text-4xl font-black text-studio-maroon dark:text-[#FDE047] tracking-tight">
                What will you build?
              </h3>
              <p className="text-xs sm:text-sm text-[#3B111D] dark:text-white/90 font-bold mt-1.5">
                Your voice is the interface. Speak a command to build live.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => onExecutePreset('Create a 3D cyber VIP pass with holographic effects')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-bold shadow-md transition active:scale-95"
              >
                Create a 3D Cyber VIP Pass
              </button>

              <button
                onClick={() => onExecutePreset('Create a holographic AI orb with 440 hertz resonance')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[rgba(255,250,242,0.6)] dark:bg-[rgba(30,20,24,0.6)] hover:bg-[rgba(255,250,242,0.9)] dark:hover:bg-white/20 text-studio-maroon dark:text-white border border-[rgba(84,28,45,0.2)] dark:border-white/20 text-xs font-bold transition active:scale-95 shadow-xs"
              >
                Synthesize AI Orb
              </button>

              <button
                onClick={() => onExecutePreset('Create a PRD for a voice-controlled cybersecurity dashboard')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[rgba(255,250,242,0.6)] dark:bg-[rgba(30,20,24,0.6)] hover:bg-[rgba(255,250,242,0.9)] dark:hover:bg-white/20 text-studio-maroon dark:text-white border border-[rgba(84,28,45,0.2)] dark:border-white/20 text-xs font-bold transition active:scale-95 shadow-xs"
              >
                Create PRD
              </button>
            </div>
          </div>
        ) : activeBuildItem === 'vip_pass' ? (
          <VipPass onOpenCode={() => setIsCodeModalOpen(true)} onToast={onToast} />
        ) : activeBuildItem === 'orb' ? (
          <HolographicOrb onOpenCode={() => setIsCodeModalOpen(true)} onToast={onToast} />
        ) : null}
      </div>

      {/* Generated Code Modal / Drawer */}
      <GeneratedCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        activeBuildItem={activeBuildItem}
        onToast={onToast}
      />
    </div>
  );
};
