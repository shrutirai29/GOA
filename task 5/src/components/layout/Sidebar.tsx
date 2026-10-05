import React from 'react';
import { WorkspaceType } from '../../types';
import { Home, FileText, Code2, Brain, Gamepad2, Info } from 'lucide-react';

interface SidebarProps {
  activeWorkspace: WorkspaceType;
  onSelectWorkspace: (ws: WorkspaceType) => void;
  onOpenWisprInfo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  onOpenWisprInfo
}) => {
  const items: Array<{
    id: WorkspaceType;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'build',
      label: 'Build',
      sub: 'Voice to UI',
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'plan',
      label: 'Plan',
      sub: 'PRD & Roadmap',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'code',
      label: 'Code',
      sub: 'Voice to Code',
      icon: <Code2 className="w-4 h-4" />
    },
    {
      id: 'think',
      label: 'Think',
      sub: 'MindMap Canvas',
      icon: <Brain className="w-4 h-4" />
    },
    {
      id: 'play',
      label: 'Play',
      sub: 'Maze Runner',
      icon: <Gamepad2 className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-[rgba(84,28,45,0.16)] dark:border-[rgba(235,220,203,0.18)] bg-[rgba(247,240,230,0.32)] dark:bg-[rgba(20,13,16,0.60)] p-3.5 flex flex-col justify-between overflow-hidden">
      <div className="space-y-3">
        <div className="px-3 text-xs font-mono tracking-widest text-studio-maroon dark:text-[#FDE047] font-black uppercase">
          Studio Workspaces
        </div>

        <nav className="space-y-1.5" aria-label="Workspaces">
          {items.map((item) => {
            const isActive = activeWorkspace === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectWorkspace(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-studio-maroon text-white dark:bg-[#7C263D] dark:text-[#FEF08A] font-black shadow-md border border-studio-maroon'
                    : 'bg-[rgba(255,250,242,0.50)] dark:bg-[rgba(30,20,24,0.50)] text-[#1C0308] dark:text-white border border-[rgba(84,28,45,0.12)] dark:border-white/15 hover:bg-[rgba(255,250,242,0.85)] dark:hover:bg-white/20 hover:text-studio-maroon dark:hover:text-[#FDE047] shadow-xs'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-studio-maroon dark:text-[#FDE047]'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { strokeWidth: 3, className: 'w-4 h-4' })}
                </span>
                <div>
                  <div className={`text-base font-serif font-black tracking-wide leading-snug ${isActive ? 'text-white dark:text-[#FEF08A]' : 'text-studio-maroon dark:text-white'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs font-sans font-extrabold leading-tight ${isActive ? 'text-white/95' : 'text-[#3B111D] dark:text-white/90'}`}>
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Wispr Info Button */}
      <div className="pt-3 border-t border-[rgba(84,28,45,0.15)] dark:border-white/20">
        <button
          onClick={onOpenWisprInfo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[rgba(255,250,242,0.45)] dark:bg-[rgba(30,20,24,0.45)] border border-[rgba(84,28,45,0.12)] dark:border-white/15 text-studio-maroon hover:text-[#501322] dark:text-white dark:hover:text-[#FDE047] text-xs font-black transition text-left shadow-xs hover:bg-[rgba(255,250,242,0.80)] dark:hover:bg-white/20"
        >
          <Info className="w-4 h-4 shrink-0 text-studio-maroon dark:text-[#FDE047]" strokeWidth={3} />
          <span className="truncate font-black">Built with Wispr Flow</span>
        </button>
      </div>
    </aside>
  );
};
