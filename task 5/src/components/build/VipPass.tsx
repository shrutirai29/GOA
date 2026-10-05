import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Volume2, Download, Code2, Sparkles, ShieldCheck, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { playClick, playVoicePing, playSuccess } from '../../lib/audio';
import { ErrorBoundary } from '../common/ErrorBoundary';

export type VipTheme = 'maroon' | 'teal' | 'gold';

// Ultra-Crisp High-Res 2D Canvas Texture for Front Face (Retina 2048x1280)
function generateFrontTexture(theme: VipTheme): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  // 1. Rich Luxury Base Gradient
  const bgGrad = ctx.createRadialGradient(1024, 640, 100, 1024, 640, 1100);
  if (theme === 'maroon') {
    bgGrad.addColorStop(0, '#5C1628');
    bgGrad.addColorStop(0.5, '#380D18');
    bgGrad.addColorStop(1, '#1A050B');
  } else if (theme === 'teal') {
    bgGrad.addColorStop(0, '#244744');
    bgGrad.addColorStop(0.5, '#132B29');
    bgGrad.addColorStop(1, '#091514');
  } else {
    bgGrad.addColorStop(0, '#664B24');
    bgGrad.addColorStop(0.5, '#3D2C14');
    bgGrad.addColorStop(1, '#1A1208');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1280);

  // 2. Algorithmic Guilloche Security Wave Patterns
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#F0D49C';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    const phase = i * 0.18;
    for (let x = 0; x <= 2048; x += 16) {
      const y = 640 + Math.sin(x * 0.007 + phase) * 220 + Math.cos(x * 0.003 - phase) * 110;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 3. Ornate Double Gold Filigree Border with Corner Brackets
  ctx.save();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 60, 1928, 1160);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(84, 84, 1880, 1112);

  const drawCornerFlourish = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = '#F5D77F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(50, 0);
    ctx.lineTo(50, 14);
    ctx.lineTo(14, 14);
    ctx.lineTo(14, 50);
    ctx.lineTo(0, 50);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(28, 28, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawCornerFlourish(96, 96, 0);
  drawCornerFlourish(1952, 96, Math.PI / 2);
  drawCornerFlourish(1952, 1184, Math.PI);
  drawCornerFlourish(96, 1184, -Math.PI / 2);
  ctx.restore();

  // 4. Photorealistic 3D Smart EMV Gold Chip (Top Left)
  ctx.save();
  const chipX = 140;
  const chipY = 160;
  const chipW = 230;
  const chipH = 175;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, '#FFF1C5');
  chipGrad.addColorStop(0.3, '#E6C665');
  chipGrad.addColorStop(0.7, '#C89B32');
  chipGrad.addColorStop(1, '#8E6716');
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 10, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(90, 60, 15, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(chipX + 65, chipY + 45, 100, 85, 12);
  ctx.moveTo(chipX, chipY + 87);
  ctx.lineTo(chipX + 65, chipY + 87);
  ctx.moveTo(chipX + 165, chipY + 87);
  ctx.lineTo(chipX + chipW, chipY + 87);
  ctx.moveTo(chipX + 115, chipY);
  ctx.lineTo(chipX + 115, chipY + 45);
  ctx.moveTo(chipX + 115, chipY + 130);
  ctx.lineTo(chipX + 115, chipY + chipH);
  ctx.stroke();
  ctx.restore();

  // 5. Contactless Hologram Wave Icon
  ctx.save();
  ctx.strokeStyle = 'rgba(240, 212, 156, 0.7)';
  ctx.lineWidth = 4;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.arc(chipX + chipW + 45, chipY + chipH / 2, 22 + r * 16, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Top Right: Royal Cinema Archive Badge & Pass Number
  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('STUDIO 01  ✦  ARCHIVE', 1900, 190);

  ctx.font = '22px monospace';
  ctx.fillStyle = 'rgba(255, 245, 230, 0.75)';
  ctx.fillText('PASS № VF-2026-VIP-0029', 1900, 230);
  ctx.restore();

  // 7. Hero Typography
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('◆  VOICE-FIRST CREATIVE DEVELOPMENT STUDIO  ◆', 140, 480);

  ctx.font = 'bold 84px serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillText('VOXFORGE VIP ACCESS', 142, 582);
  const titleGrad = ctx.createLinearGradient(140, 500, 140, 580);
  titleGrad.addColorStop(0, '#FFF8E1');
  titleGrad.addColorStop(0.5, '#E8C56E');
  titleGrad.addColorStop(1, '#B8860B');
  ctx.fillStyle = titleGrad;
  ctx.fillText('VOXFORGE VIP ACCESS', 140, 580);
  ctx.restore();

  // 8. Keyholder Box
  ctx.save();
  const boxX = 140;
  const boxY = 660;
  const boxW = 1768;
  const boxH = 460;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('AUTHORIZED KEYHOLDER / PASS HOLDER', boxX + 60, boxY + 70);

  ctx.font = 'bold 64px serif';
  ctx.fillStyle = '#FFF8E7';
  ctx.fillText('SHRUTI RAI', boxX + 60, boxY + 155);

  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(245, 230, 215, 0.85)';
  ctx.fillText('Lead Voice AI Engineer  •  Hacker House Goa 2026', boxX + 60, boxY + 210);

  ctx.font = '20px monospace';
  ctx.fillStyle = '#4ADE80';
  ctx.fillText('● BIOMETRIC SYNAPSE: VERIFIED (WISPR FLOW ACCELERATED)', boxX + 60, boxY + 270);

  // 9. Audio Waveform
  const waveStartX = 1180;
  const waveY = boxY + 360;
  const barHeights = [45, 95, 65, 145, 80, 165, 110, 185, 90, 150, 75, 130, 60, 110, 45];
  barHeights.forEach((h, i) => {
    const x = waveStartX + i * 36;
    const barGrad = ctx.createLinearGradient(x, waveY, x, waveY - h);
    barGrad.addColorStop(0, '#B8860B');
    barGrad.addColorStop(0.5, '#F5D77F');
    barGrad.addColorStop(1, '#38BDF8');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(x, waveY - h, 16, h, 8);
    ctx.fill();
  });
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Ultra-Crisp High-Res 2D Canvas Texture for Back Face
function generateBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#140D10';
  ctx.fillRect(0, 0, 2048, 1280);

  // Magnetic Stripe
  ctx.fillStyle = '#060405';
  ctx.fillRect(0, 100, 2048, 220);

  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = 'rgba(240, 212, 156, 0.45)';
  ctx.fillText('ENCRYPTED WISPR VOICE STREAM // AUTH TOKEN: 0x7F29BA9418 // DO NOT EXPOSE TO HIGH FLUX', 100, 215);

  // Signature Panel
  const sigX = 140;
  const sigY = 400;
  const sigW = 1060;
  const sigH = 160;
  ctx.fillStyle = '#FBF6EE';
  ctx.fillRect(sigX, sigY, sigW, sigH);

  ctx.fillStyle = '#3B121D';
  ctx.font = 'italic 54px serif';
  ctx.fillText('Shruti Rai  •  Authorized', sigX + 60, sigY + 105);

  // Barcode
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(140, 640, 1768, 260, 18);
  ctx.fill();

  let bx = 220;
  while (bx < 1820) {
    const barWidth = (bx % 11 === 0) ? 9 : (bx % 5 === 0) ? 6 : (bx % 3 === 0) ? 4 : 2;
    ctx.fillStyle = '#0F090C';
    ctx.fillRect(bx, 680, barWidth, 150);
    bx += barWidth + ((bx % 7 === 0) ? 7 : (bx % 2 === 0) ? 4 : 2);
  }

  ctx.textAlign = 'center';
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#0F090C';
  ctx.fillText('* VF - 2026 - HACKERHOUSE - GOA - VIP *', 1024, 870);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface CardMeshProps {
  isFlipped: boolean;
  theme: VipTheme;
  glowEnabled: boolean;
}

const CardMesh: React.FC<CardMeshProps> = ({
  isFlipped,
  theme,
  glowEnabled
}) => {
  const meshRef = useRef<THREE.Group>(null);

  const frontTexture = useMemo(() => generateFrontTexture(theme), [theme]);
  const backTexture = useMemo(() => generateBackTexture(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetFlip = isFlipped ? Math.PI : 0;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetFlip, 0.1);
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.07;
  });

  return (
    <group ref={meshRef}>
      {/* Golden Metallic Beveled Card Core Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.0, 0.05]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* Front Face with Texture */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[3.2, 2.0]} />
        <meshStandardMaterial
          map={frontTexture}
          roughness={0.24}
          metalness={0.45}
        />
      </mesh>

      {/* Back Face with Texture */}
      <mesh position={[0, 0, -0.026]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.2, 2.0]} />
        <meshStandardMaterial
          map={backTexture}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>

      {/* Dynamic Golden Halo Glow Rim */}
      {glowEnabled && (
        <mesh>
          <boxGeometry args={[3.24, 2.04, 0.055]} />
          <meshBasicMaterial
            color="#F5D77F"
            transparent
            opacity={0.28}
            wireframe
          />
        </mesh>
      )}

      {/* Soft Contact Shadow beneath */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

interface VipPassProps {
  onOpenCode: () => void;
  onToast: (msg: string) => void;
}

export const VipPass: React.FC<VipPassProps> = ({ onOpenCode, onToast }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [theme, setTheme] = useState<VipTheme>('maroon');
  const [autoRotate, setAutoRotate] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const controlsRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const cam = controls.object;
      const target = controls.target || new THREE.Vector3(0, 0, 0);
      const dist = cam.position.distanceTo(target);
      if (dist > 2.0) {
        cam.position.lerp(target, 0.25);
        controls.update();
        playClick();
      }
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const cam = controls.object;
      const target = controls.target || new THREE.Vector3(0, 0, 0);
      const dist = cam.position.distanceTo(target);
      if (dist < 9.5) {
        const dir = cam.position.clone().sub(target).normalize();
        cam.position.addScaledVector(dir, dist * 0.25);
        controls.update();
        playClick();
      }
    }
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      playClick();
      onToast('Camera view reset to default');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playClick();
    onToast(isFlipped ? 'Flipped to Front Face' : 'Flipped to Security Backside');
  };

  const handleVoicePing = () => {
    playVoicePing();
    onToast('⚡ Biometric Synapse Verified: Pass VF-2026-VIP-0029 active');
  };

  const handleDownload = () => {
    playSuccess();
    onToast('VIP Access Pass snapshot prepared.');
  };

  return (
    <ErrorBoundary fallbackTitle="3D VIP Pass Scene">
      <div className="h-full flex flex-col min-h-0 gap-2 overflow-hidden">
        {/* Top Header Pill & Title */}
        <div className="shrink-0 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[rgba(181,138,82,0.12)] dark:bg-yellow-400/20 border border-[rgba(181,138,82,0.25)] dark:border-yellow-400/40 text-studio-gold dark:text-[#FDE047] text-[9px] font-mono tracking-widest uppercase font-bold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>VIP ACCESS PASS</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-studio-maroon dark:text-[#FDE047] leading-tight mt-0.5">
            3D Cyber VIP Pass
          </h3>
          <p className="text-[11px] text-studio-textSec dark:text-white/90">
            Holographic access card with biometric verification and mouse-perspective lighting.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
          
          {/* Main 3D Canvas (8 cols) — Dark rounded cinematic viewport */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-[rgba(84,28,45,0.14)] dark:border-[rgba(235,220,203,0.15)] shadow-xl h-full min-h-0 flex items-center justify-center bg-gradient-to-b from-[#1C1417]/90 via-[#261A1E]/90 to-[#120B0D]/95 backdrop-blur-xl cursor-grab active:cursor-grabbing select-none">
            
            {/* Ambient Radial Spotlight */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(181,138,82,0.15)_0%,transparent_70%)]" />

            <Suspense fallback={<div className="text-xs font-mono text-studio-gold animate-pulse">Initializing 3D Canvas...</div>}>
              <Canvas camera={{ position: [0, 0, 5.6], fov: 42 }}>
                <ambientLight intensity={1.4} />
                <directionalLight position={[5, 6, 5]} intensity={2.4} color="#FFF8EB" />
                <directionalLight position={[-5, -4, -3]} intensity={1.2} color="#D4AF37" />
                <pointLight position={[0, 0, 3.5]} intensity={1.6} color="#FFF9F1" />
                <pointLight position={[0, -2, 2]} intensity={0.9} color="#7C263D" />

                <CardMesh
                  isFlipped={isFlipped}
                  theme={theme}
                  glowEnabled={glowEnabled}
                />
                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enableRotate={true}
                  enablePan={true}
                  enableDamping={true}
                  dampingFactor={0.06}
                  minDistance={2.0}
                  maxDistance={9.0}
                  autoRotate={autoRotate}
                  autoRotateSpeed={2.2}
                  makeDefault
                />
              </Canvas>
            </Suspense>

            {/* Top Interactive Label */}
            <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-studio-success animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-studio-gold dark:text-[#FDE047] font-bold uppercase">
                BIOMETRIC SYNAPSE • 360° ORBIT
              </span>
            </div>

            {/* Interactive Floating Zoom & Reset Control HUD */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In (or use mouse scroll wheel)"
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 text-white hover:text-[#FDE047] border border-white/15 backdrop-blur-md transition shadow-md active:scale-95"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out (or use mouse scroll wheel)"
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 text-white hover:text-[#FDE047] border border-white/15 backdrop-blur-md transition shadow-md active:scale-95"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                title="Reset 3D View"
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 text-white hover:text-[#FDE047] border border-white/15 backdrop-blur-md transition shadow-md active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Sub-tag */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] font-mono text-white/90 pointer-events-none">
              <ShieldCheck className="w-3 h-3 text-studio-gold dark:text-[#FDE047]" />
              <span>
                {isFlipped ? 'Security Hologram & Magnetic Stripe (Back)' : 'Embossed Gold Filigree & Biometrics (Front)'}
              </span>
            </div>

            {/* Interaction Legend */}
            <div className="absolute bottom-3 right-3 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90 shadow-sm">
              <span className="text-studio-gold dark:text-[#FDE047] font-bold">🖱 Drag:</span> Rotate 360°
              <span className="text-white/40">•</span>
              <span className="text-studio-gold dark:text-[#FDE047] font-bold">🔍 Scroll:</span> Zoom In/Out
            </div>
          </div>

          {/* Right Control Panel (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl p-4 flex flex-col justify-between h-full min-h-0 backdrop-blur-md bg-[rgba(247,240,230,0.35)] dark:bg-[rgba(25,18,20,0.55)] border border-[rgba(84,28,45,0.12)] dark:border-[rgba(235,220,203,0.12)] shadow-sm overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-studio-maroon dark:text-[#FDE047]">
                  Customize
                </h4>
                <p className="text-xs text-studio-textSec dark:text-white/80 mt-0.5">Studio colorway & interaction physics</p>
              </div>

              {/* Colorways */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-studio-textSec dark:text-[#FDE047] font-bold tracking-wider">
                  COLORWAY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setTheme('maroon');
                      playClick();
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-serif font-bold transition border ${
                      theme === 'maroon'
                        ? 'bg-studio-maroon text-white dark:bg-[#7C263D] dark:text-[#FEF08A] border-studio-maroon shadow-sm'
                        : 'bg-transparent text-studio-textSec dark:text-white border-[rgba(84,28,45,0.12)] dark:border-white/20 hover:border-studio-maroon/40 hover:text-studio-maroon dark:hover:text-[#FDE047]'
                    }`}
                  >
                    Royal Maroon
                  </button>
                  <button
                    onClick={() => {
                      setTheme('teal');
                      playClick();
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-serif font-bold transition border ${
                      theme === 'teal'
                        ? 'bg-[#1E4D48] text-white border-[#1E4D48] shadow-sm'
                        : 'bg-transparent text-studio-textSec dark:text-white border-[rgba(84,28,45,0.12)] dark:border-white/20 hover:border-[#1E4D48]/50 hover:text-[#1E4D48] dark:hover:text-[#FDE047]'
                    }`}
                  >
                    Vintage Teal
                  </button>
                  <button
                    onClick={() => {
                      setTheme('gold');
                      playClick();
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-serif font-bold transition border ${
                      theme === 'gold'
                        ? 'bg-[#B58A52] text-white border-[#B58A52] shadow-sm'
                        : 'bg-transparent text-studio-textSec dark:text-white border-[rgba(84,28,45,0.12)] dark:border-white/20 hover:border-[#B58A52]/50 hover:text-[#B58A52] dark:hover:text-[#FDE047]'
                    }`}
                  >
                    Midnight Gold
                  </button>
                </div>
              </div>

              {/* Effects Toggles - Clean rows with no white box wrappers */}
              <div className="pt-2 border-t border-[rgba(84,28,45,0.08)] dark:border-white/10">
                <label className="text-[10px] font-mono uppercase text-studio-textSec dark:text-[#FDE047] font-bold tracking-wider block mb-2">
                  EFFECTS
                </label>

                <div className="divide-y divide-[rgba(84,28,45,0.06)] dark:divide-white/10">
                  {/* Auto Rotate Switch */}
                  <div
                    onClick={() => {
                      setAutoRotate(!autoRotate);
                      playClick();
                    }}
                    className="flex items-center justify-between py-2 px-1 cursor-pointer group hover:bg-black/[0.02] dark:hover:bg-white/[0.05] rounded-lg transition"
                  >
                    <span className="text-xs font-medium text-studio-text dark:text-white group-hover:text-studio-maroon dark:group-hover:text-[#FDE047] transition">
                      Auto Rotate Turntable
                    </span>
                    <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${autoRotate ? 'bg-studio-maroon dark:bg-yellow-400' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${autoRotate ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Holographic Glow Switch */}
                  <div
                    onClick={() => {
                      setGlowEnabled(!glowEnabled);
                      playClick();
                    }}
                    className="flex items-center justify-between py-2 px-1 cursor-pointer group hover:bg-black/[0.02] dark:hover:bg-white/[0.05] rounded-lg transition"
                  >
                    <span className="text-xs font-medium text-studio-text dark:text-white group-hover:text-studio-maroon dark:group-hover:text-[#FDE047] transition">
                      Holographic Golden Glow
                    </span>
                    <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${glowEnabled ? 'bg-studio-maroon dark:bg-yellow-400' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${glowEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-[rgba(84,28,45,0.08)] dark:border-white/10">
              <button
                onClick={handleFlip}
                className="w-full h-10 rounded-2xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Card ({isFlipped ? 'Front' : 'Back'})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleVoicePing}
                  className="h-9 rounded-2xl bg-transparent hover:bg-studio-maroon/10 border border-[rgba(84,28,45,0.16)] dark:border-white/20 text-studio-text dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                  <span>Voice Ping</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="h-9 rounded-2xl bg-transparent hover:bg-studio-maroon/10 border border-[rgba(84,28,45,0.16)] dark:border-white/20 text-studio-text dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047] text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <button
                onClick={onOpenCode}
                className="w-full h-8 rounded-2xl border border-dashed border-[rgba(84,28,45,0.22)] dark:border-yellow-400/40 text-studio-textSec dark:text-[#FDE047] hover:text-studio-maroon dark:hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition hover:bg-studio-maroon/5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>&lt;/&gt; View Generated Three.js Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
