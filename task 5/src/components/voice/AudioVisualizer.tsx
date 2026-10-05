import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  onToast?: (msg: string) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onToast }) => {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const toggleMic = async () => {
    if (isActive) {
      stopMic();
      onToast?.('Local audio visualizer stopped.');
    } else {
      await startMic();
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsActive(true);
      onToast?.('Local audio visualizer active.');
    } catch {
      onToast?.('Microphone visualization unavailable. Wispr Flow dictation still works normally.');
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 24;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (isActive && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Subtle simulated idle wave
        const t = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(8, Math.sin(t + i * 0.4) * 16 + 18);
        }
      }

      const barWidth = (w / bufferLength) * 1.4;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.85;
        const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
        grad.addColorStop(0, 'rgba(181, 138, 82, 0.2)');
        grad.addColorStop(1, isActive ? '#7C263D' : 'rgba(181, 138, 82, 0.7)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, h - barHeight, barWidth - 1.5, barHeight);
        x += barWidth;
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-studio-bgSec/70 dark:bg-studio-darkSec/70 border border-studio-border dark:border-studio-darkBorder">
      <button
        onClick={toggleMic}
        className="p-1 rounded-lg text-studio-maroon dark:text-studio-gold hover:bg-studio-card dark:hover:bg-studio-darkCard transition"
        title={isActive ? 'Turn off local visualizer' : 'Test with local microphone visualizer'}
      >
        {isActive ? <Mic className="w-3.5 h-3.5 text-studio-maroon animate-pulse" /> : <MicOff className="w-3.5 h-3.5 text-studio-textSec" />}
      </button>

      <div className="flex flex-col">
        <canvas ref={canvasRef} width={80} height={20} className="w-20 h-5" />
        <span className="text-[9px] font-mono tracking-tight text-studio-textSec truncate">
          Local audio visualizer
        </span>
      </div>
    </div>
  );
};
