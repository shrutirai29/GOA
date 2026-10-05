import React, { useRef, useState, useEffect } from 'react';
import { MindMapNodeItem } from '../../types';
import { Plus, RefreshCw, Download, Copy, Trash2 } from 'lucide-react';
import { playClick, playSuccess } from '../../lib/audio';

const INITIAL_NODES: MindMapNodeItem[] = [
  { id: '1', label: 'CYBERSECURITY PRODUCT', x: 360, y: 220, category: 'Core', color: '#7C263D' },
  { id: '2', label: 'Authentication & MFA', x: 180, y: 110, category: 'Security', color: '#B58A52', parentId: '1' },
  { id: '3', label: 'Threat Monitoring', x: 540, y: 110, category: 'Detection', color: '#4D7774', parentId: '1' },
  { id: '4', label: 'Incident Alerts', x: 180, y: 330, category: 'Ops', color: '#541C2D', parentId: '1' },
  { id: '5', label: 'Role & User Policy', x: 540, y: 330, category: 'Governance', color: '#D9A9A5', parentId: '1' }
];

interface MindMapWorkspaceProps {
  externalTopic?: string;
  onToast: (msg: string) => void;
}

export const MindMapWorkspace: React.FC<MindMapWorkspaceProps> = ({ externalTopic, onToast }) => {
  const [nodes, setNodes] = useState<MindMapNodeItem[]>(INITIAL_NODES);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (externalTopic && externalTopic.trim()) {
      const newId = String(nodes.length + 1);
      const angle = (nodes.length * 1.35) % (Math.PI * 2);
      const radius = 175;

      const newNode: MindMapNodeItem = {
        id: newId,
        label: externalTopic.trim(),
        x: 360 + Math.cos(angle) * radius,
        y: 220 + Math.sin(angle) * radius,
        category: 'Spoken Idea',
        color: '#B58A52',
        parentId: '1'
      };

      setNodes((prev) => [...prev, newNode]);
      playSuccess();
      onToast(`Added node: "${externalTopic}"`);
    }
  }, [externalTopic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw curved Bezier links
    nodes.forEach((node) => {
      if (!node.parentId) return;
      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return;

      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      const midX = (parent.x + node.x) / 2;
      const midY = (parent.y + node.y) / 2;
      ctx.quadraticCurveTo(midX, midY - 20, node.x, node.y);
      ctx.strokeStyle = 'rgba(181, 138, 82, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isCore = node.id === '1';
      const radius = isCore ? 30 : 22;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius - 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 249, 241, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = isCore ? 'bold 12px serif' : '600 11px sans-serif';
      ctx.fillStyle = '#2D2522';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
    });
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodes.find((n) => Math.hypot(n.x - x, n.y - y) <= 28);
    if (clicked) setDraggedNodeId(clicked.id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNodeId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes((prev) => prev.map((n) => (n.id === draggedNodeId ? { ...n, x, y } : n)));
  };

  const handleAddNode = () => {
    const newId = String(nodes.length + 1);
    const newNode: MindMapNodeItem = {
      id: newId,
      label: `Idea Node ${newId}`,
      x: 360 + (Math.random() * 160 - 80),
      y: 220 + (Math.random() * 160 - 80),
      category: 'Concept',
      color: '#4D7774',
      parentId: '1'
    };
    setNodes((prev) => [...prev, newNode]);
    playClick();
    onToast('Added node.');
  };

  const handleDeleteLast = () => {
    if (nodes.length <= 1) return;
    setNodes((prev) => prev.slice(0, prev.length - 1));
    playClick();
    onToast('Removed last node.');
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'voxforge-mindmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    playSuccess();
    onToast('Exported MindMap PNG.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(84,28,45,0.06)] dark:border-[rgba(235,220,203,0.08)]">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-studio-gold dark:text-[#FDE047] font-bold">
            Concept MindMap
          </span>
          <h2 className="font-serif text-2xl font-bold text-studio-maroon dark:text-[#FDE047] mt-0.5">
            Think Out Loud
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNode}
            className="px-3.5 py-1.5 rounded-xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            onClick={handleDeleteLast}
            className="p-1.5 rounded-xl border border-[rgba(84,28,45,0.1)] dark:border-white/20 text-studio-textSec dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] transition"
            title="Delete last node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportPNG}
            className="px-3.5 py-1.5 rounded-xl bg-transparent hover:bg-studio-maroon/10 border border-[rgba(84,28,45,0.18)] dark:border-white/20 text-xs text-studio-text dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>

          <button
            onClick={() => setNodes(INITIAL_NODES)}
            className="p-1.5 rounded-xl border border-[rgba(84,28,45,0.1)] text-studio-textSec hover:text-studio-maroon transition"
            title="Reset layout"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Large Canvas */}
      <div className="rounded-2xl p-6 flex flex-col items-center bg-[rgba(255,250,244,0.5)] dark:bg-[rgba(30,22,25,0.45)] border border-[rgba(181,138,82,0.2)] shadow-sm">
        <canvas
          ref={canvasRef}
          width={720}
          height={440}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggedNodeId(null)}
          className="w-full max-w-3xl h-[420px] bg-[rgba(247,240,230,0.5)] dark:bg-[rgba(33,27,28,0.4)] rounded-2xl cursor-grab active:cursor-grabbing border border-[rgba(84,28,45,0.06)]"
        />

        <div className="w-full flex items-center justify-between pt-3 text-[11px] font-mono text-studio-textSec">
          <span>Speak: "Add a Security branch" to expand branches</span>
          <span>Click & drag nodes to position</span>
        </div>
      </div>
    </div>
  );
};
