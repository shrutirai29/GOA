import React, { useState } from 'react';
import { PRDData } from '../../types';
import { Copy, Download, CheckCircle2 } from 'lucide-react';
import { playClick, playSuccess } from '../../lib/audio';

interface PRDWorkspaceProps {
  prdData: PRDData;
  onToast: (msg: string) => void;
}

export const PRDWorkspace: React.FC<PRDWorkspaceProps> = ({ prdData, onToast }) => {
  const [checkpoints, setCheckpoints] = useState(prdData.checkpoints);
  const [copiedMd, setCopiedMd] = useState(false);

  const toggleCheckpoint = (id: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) => (cp.id === id ? { ...cp, checked: !cp.checked } : cp))
    );
    playClick();
    onToast('Checkpoint updated.');
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(prdData.markdownContent);
    setCopiedMd(true);
    playSuccess();
    onToast('PRD Markdown copied to clipboard!');
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([prdData.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'voxforge-prd-spec.md';
    link.click();
    URL.revokeObjectURL(url);
    playSuccess();
    onToast('Exported voxforge-prd-spec.md');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(84,28,45,0.06)] dark:border-[rgba(235,220,203,0.08)]">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-studio-gold dark:text-[#FDE047] font-bold">
            Editorial Document
          </span>
          <h2 className="font-serif text-2xl font-bold text-studio-maroon dark:text-[#FDE047] mt-0.5">
            Product Requirements Document
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-1.5 rounded-xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-3.5 py-1.5 rounded-xl bg-transparent hover:bg-studio-maroon/10 border border-[rgba(84,28,45,0.18)] dark:border-white/20 text-xs text-studio-text dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Split: Clean Document (8 cols) + Simple Roadmap (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl p-6 sm:p-8 space-y-6 bg-[rgba(255,250,244,0.5)] dark:bg-[rgba(30,22,25,0.45)] border border-[rgba(181,138,82,0.2)] dark:border-white/15 shadow-sm">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-studio-maroon dark:text-[#FDE047]">
              {prdData.title}
            </h3>
            <p className="text-xs text-studio-textSec dark:text-white/85 mt-1.5 leading-relaxed">
              {prdData.overview}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-studio-text dark:text-[#FDE047]">
              Problem Statement
            </h4>
            <p className="text-xs text-studio-textSec dark:text-white/85 leading-relaxed">
              {prdData.problem}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-studio-text dark:text-[#FDE047]">
              Core Objectives
            </h4>
            <ul className="space-y-1.5 text-xs text-studio-textSec dark:text-white/85">
              {prdData.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-studio-gold dark:text-[#FDE047]">✦</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-3 border-t border-[rgba(84,28,45,0.06)] dark:border-white/10">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-studio-text dark:text-[#FDE047]">
              User Stories & Acceptance Criteria
            </h4>
            {prdData.userStories.map((story) => (
              <div
                key={story.id}
                className="p-3.5 rounded-2xl bg-[rgba(247,240,230,0.5)] dark:bg-[rgba(33,27,28,0.4)] border border-[rgba(84,28,45,0.06)] text-xs space-y-1.5"
              >
                <div className="font-mono text-[10px] text-studio-gold font-bold">
                  {story.id} • P0
                </div>
                <p className="text-studio-text dark:text-studio-darkText">
                  <b>As a</b> {story.role}, <b>I want to</b> {story.action}, <b>so that</b> {story.benefit}.
                </p>
                <div className="pt-1 space-y-1 text-[11px] text-studio-textSec">
                  {story.criteria.map((cr, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-studio-success" />
                      <span>{cr}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl p-6 space-y-4 bg-[rgba(255,250,244,0.5)] dark:bg-[rgba(30,22,25,0.45)] border border-[rgba(181,138,82,0.2)] shadow-sm">
            <h4 className="font-serif text-base font-bold text-studio-maroon dark:text-studio-gold">
              Roadmap Milestones
            </h4>

            <div className="space-y-3">
              {prdData.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-[rgba(247,240,230,0.5)] dark:bg-[rgba(33,27,28,0.4)] border border-[rgba(84,28,45,0.06)] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-studio-text dark:text-studio-darkText">
                      {m.phase}: {m.name}
                    </span>
                    <span className="font-mono text-[10px] text-studio-gold font-bold">
                      {m.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-[rgba(84,28,45,0.08)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-studio-maroon dark:bg-studio-gold h-full rounded-full"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-studio-textSec">
                    <span>{m.owner}</span>
                    <span>{m.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Checkpoints */}
          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <h4 className="font-serif text-base font-bold text-studio-maroon dark:text-studio-gold">
              Critical Path
            </h4>

            <div className="space-y-2 text-xs">
              {checkpoints.map((cp) => (
                <label
                  key={cp.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[rgba(84,28,45,0.03)] cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={cp.checked}
                    onChange={() => toggleCheckpoint(cp.id)}
                    className="accent-studio-maroon cursor-pointer"
                  />
                  <span
                    className={
                      cp.checked
                        ? 'text-studio-textSec line-through'
                        : 'text-studio-text dark:text-studio-darkText font-medium'
                    }
                  >
                    {cp.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
