import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { playClick, playCrystal, playVictory, playError, playStart } from '../../lib/audio';
import confetti from 'canvas-confetti';

interface MazeWorkspaceProps {
  externalVoiceCommand?: 'up' | 'down' | 'left' | 'right' | null;
  onToast: (msg: string) => void;
}

const MAZE_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

interface Crystal {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

const INITIAL_CRYSTALS: Crystal[] = [
  { id: 'c1', x: 3, y: 1, collected: false },
  { id: 'c2', x: 5, y: 5, collected: false },
  { id: 'c3', x: 8, y: 2, collected: false },
  { id: 'c4', x: 2, y: 7, collected: false }
];

export const MazeWorkspace: React.FC<MazeWorkspaceProps> = ({
  externalVoiceCommand,
  onToast
}) => {
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const portal = { x: 8, y: 8 };
  const [crystals, setCrystals] = useState<Crystal[]>(INITIAL_CRYSTALS);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Voice commands: "UP", "DOWN", "LEFT", "RIGHT", "RESET"');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (isWon) return;

      setPlayer((prev) => {
        const nextX = prev.x + dx;
        const nextY = prev.y + dy;

        if (MAZE_GRID[nextY] && MAZE_GRID[nextY][nextX] === 0) {
          setMoves((m) => m + 1);
          playClick();

          setCrystals((prevCrystals) =>
            prevCrystals.map((c) => {
              if (!c.collected && c.x === nextX && c.y === nextY) {
                setScore((s) => s + 50);
                playCrystal();
                onToast('💎 Sound Crystal (+50 pts)');
                return { ...c, collected: true };
              }
              return c;
            })
          );

          if (nextX === portal.x && nextY === portal.y) {
            setIsWon(true);
            setScore((s) => s + 200);
            playVictory();
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            setStatusMessage('🏆 VOICE QUEST COMPLETE (+200 pts)');
            onToast('🎉 Victory! Portal reached.');
          }

          return { x: nextX, y: nextY };
        } else {
          playError();
          setStatusMessage('Barrier collision! Choose another path.');
          setTimeout(() => {
            setStatusMessage('Voice commands: "UP", "DOWN", "LEFT", "RIGHT", "RESET"');
          }, 1200);
          return prev;
        }
      });
    },
    [isWon, onToast]
  );

  useEffect(() => {
    if (externalVoiceCommand) {
      if (externalVoiceCommand === 'up') movePlayer(0, -1);
      if (externalVoiceCommand === 'down') movePlayer(0, 1);
      if (externalVoiceCommand === 'left') movePlayer(-1, 0);
      if (externalVoiceCommand === 'right') movePlayer(1, 0);
    }
  }, [externalVoiceCommand, movePlayer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 36;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < MAZE_GRID.length; r++) {
      for (let c = 0; c < MAZE_GRID[r].length; c++) {
        const x = c * cellSize;
        const y = r * cellSize;

        if (MAZE_GRID[r][c] === 1) {
          ctx.fillStyle = '#2D2522';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = 'rgba(181, 138, 82, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#FFF9F1';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    crystals.forEach((gem) => {
      if (!gem.collected) {
        const gx = gem.x * cellSize + cellSize / 2;
        const gy = gem.y * cellSize + cellSize / 2;
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', gx, gy);
      }
    });

    const px = portal.x * cellSize + cellSize / 2;
    const py = portal.y * cellSize + cellSize / 2;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌀', px, py);

    const plx = player.x * cellSize + cellSize / 2;
    const ply = player.y * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.arc(plx, ply, cellSize / 2.6, 0, Math.PI * 2);
    ctx.fillStyle = '#7C263D';
    ctx.fill();
    ctx.strokeStyle = '#B58A52';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [player, crystals, portal]);

  const handleReset = () => {
    setPlayer({ x: 1, y: 1 });
    setCrystals(INITIAL_CRYSTALS);
    setScore(0);
    setMoves(0);
    setIsWon(false);
    setStatusMessage('Voice commands: "UP", "DOWN", "LEFT", "RIGHT", "RESET"');
    playStart();
    onToast('Maze reset.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(84,28,45,0.06)] dark:border-[rgba(235,220,203,0.08)]">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-studio-gold dark:text-[#FDE047] font-bold">
            Hands-Free Navigation
          </span>
          <h2 className="font-serif text-2xl font-bold text-studio-maroon dark:text-[#FDE047] mt-0.5">
            Voice Quest
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/10 border border-[rgba(181,138,82,0.2)] dark:border-white/20 text-xs font-mono flex items-center gap-2">
            <span className="text-studio-maroon dark:text-[#FDE047] font-bold">Score: {score}</span>
            <span className="dark:text-white/50">·</span>
            <span className="text-studio-textSec dark:text-white/80">Moves: {moves}</span>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl border border-[rgba(84,28,45,0.1)] dark:border-white/20 text-studio-textSec dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] transition"
            title="Reset Maze"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Single Arena */}
      <div className="rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-5 max-w-2xl mx-auto bg-[rgba(255,250,244,0.5)] dark:bg-[rgba(30,22,25,0.45)] border border-[rgba(181,138,82,0.2)] shadow-sm">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="rounded-2xl border border-[rgba(84,28,45,0.12)] shadow-sm max-w-full"
        />

        <div className="text-xs font-mono text-center text-studio-maroon dark:text-studio-gold font-semibold">
          {statusMessage}
        </div>

        {/* Minimal Tactile D-Pad */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <button
            onClick={() => movePlayer(0, -1)}
            className="w-10 h-10 rounded-xl bg-transparent hover:bg-studio-maroon hover:text-white text-studio-text dark:text-studio-darkText border border-[rgba(84,28,45,0.18)] dark:border-[rgba(235,220,203,0.18)] flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-sm"
          >
            ▲
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => movePlayer(-1, 0)}
              className="w-10 h-10 rounded-xl bg-transparent hover:bg-studio-maroon hover:text-white text-studio-text dark:text-studio-darkText border border-[rgba(84,28,45,0.18)] dark:border-[rgba(235,220,203,0.18)] flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-sm"
            >
              ◀
            </button>
            <button
              onClick={() => movePlayer(0, 1)}
              className="w-10 h-10 rounded-xl bg-transparent hover:bg-studio-maroon hover:text-white text-studio-text dark:text-studio-darkText border border-[rgba(84,28,45,0.18)] dark:border-[rgba(235,220,203,0.18)] flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-sm"
            >
              ▼
            </button>
            <button
              onClick={() => movePlayer(1, 0)}
              className="w-10 h-10 rounded-xl bg-transparent hover:bg-studio-maroon hover:text-white text-studio-text dark:text-studio-darkText border border-[rgba(84,28,45,0.18)] dark:border-[rgba(235,220,203,0.18)] flex items-center justify-center font-bold text-xs transition active:scale-95 shadow-sm"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
