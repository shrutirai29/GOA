import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Zap, Radio, Sliders, Code2, Sparkles, Activity, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { playClick, playStart, playSuccess } from '../../lib/audio';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface OrbMeshProps {
  frequency: number;
  isPulsing: boolean;
}

const OrbMesh: React.FC<OrbMeshProps> = ({ frequency, isPulsing }) => {
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const barsGroupRef = useRef<THREE.Group>(null);

  const speed = (frequency / 440) * 0.75;

  // Orbiting equalizer bars data
  const barCount = 32;
  const barsData = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const angle = (i / barCount) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 1.72,
        z: Math.sin(angle) * 1.72,
        angle
      };
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y += delta * speed * 0.35;
      outerSphereRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * speed * 0.9;
      ring1Ref.current.rotation.y += delta * speed * 0.4;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * speed * 1.1;
      ring2Ref.current.rotation.z += delta * speed * 0.6;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * speed * 1.3;
      ring3Ref.current.rotation.x += delta * speed * 0.3;
    }

    if (barsGroupRef.current) {
      barsGroupRef.current.rotation.y += delta * speed * 0.25;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * speed * 1.2;
      coreRef.current.rotation.x += delta * speed * 0.8;
      const pulseBase = Math.sin(t * (speed * 4)) * 0.12 + 1;
      const extraPulse = isPulsing ? 1.4 : 1.0;
      coreRef.current.scale.setScalar(pulseBase * extraPulse);
    }
  });

  return (
    <group>
      {/* Outer Luxury Glass Refraction Shell */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[1.4, 48, 48]} />
        <meshPhysicalMaterial
          color="#E6D3B3"
          transparent
          opacity={0.28}
          roughness={0.08}
          metalness={0.2}
          transmission={0.88}
          ior={1.4}
        />
      </mesh>

      {/* Gyro Ring 1 with Pearl Nodes (Imperial Gold) */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.75, 0.03, 16, 120]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[1.75, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#FFF1C5" emissive="#D4AF37" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[-1.75, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#FFF1C5" emissive="#D4AF37" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Gyro Ring 2 (Royal Cinema Maroon) */}
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[1.98, 0.026, 16, 120]} />
          <meshStandardMaterial color="#8B1E3F" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.98, 0]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#FFB6C1" emissive="#8B1E3F" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Gyro Ring 3 (Ethereal Vintage Teal) */}
      <group ref={ring3Ref}>
        <mesh>
          <torusGeometry args={[2.22, 0.022, 16, 120]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 2.22]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#E0F2FE" emissive="#38BDF8" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Faceted Crystalline Radiant Core (Icosahedron) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#F5D77F"
          emissive="#7C263D"
          emissiveIntensity={2.2}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Equatorial Harmonic Equalizer Bar Ring */}
      <group ref={barsGroupRef}>
        {barsData.map((bar, i) => {
          const height = 0.08 + Math.sin(i * 0.6 + frequency * 0.02) * 0.14 + 0.12;
          return (
            <mesh key={i} position={[bar.x, 0, bar.z]}>
              <boxGeometry args={[0.04, height, 0.04]} />
              <meshStandardMaterial
                color="#D4AF37"
                emissive="#F5D77F"
                emissiveIntensity={0.8}
              />
            </mesh>
          );
        })}
      </group>

      {/* Celestial Nebula Stardust Clouds */}
      <points>
        <sphereGeometry args={[2.4, 32, 32]} />
        <pointsMaterial
          size={0.035}
          color="#F5D77F"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

interface HolographicOrbProps {
  onOpenCode: () => void;
  onToast: (msg: string) => void;
}

export const HolographicOrb: React.FC<HolographicOrbProps> = ({ onOpenCode, onToast }) => {
  const [frequency, setFrequency] = useState(440);
  const [isPulsing, setIsPulsing] = useState(false);
  const controlsRef = useRef<any>(null);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const cam = controls.object;
      const target = controls.target || new THREE.Vector3(0, 0, 0);
      const dist = cam.position.distanceTo(target);
      if (dist > 1.8) {
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
      if (dist < 12) {
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

  const handlePulse = () => {
    setIsPulsing(true);
    playSuccess();
    onToast(`🔮 Core harmonic resonance pulsed at ${frequency} Hz!`);
    setTimeout(() => setIsPulsing(false), 900);
  };

  const handleVoiceBeacon = () => {
    playStart();
    onToast('🔊 Wispr Harmonic Frequency broadcast active.');
  };

  return (
    <ErrorBoundary fallbackTitle="Holographic Orb Scene">
      <div className="h-full flex flex-col min-h-0 gap-2 overflow-hidden">
        {/* Top Header Pill & Title */}
        <div className="shrink-0 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[rgba(181,138,82,0.12)] dark:bg-yellow-400/20 border border-[rgba(181,138,82,0.25)] dark:border-yellow-400/40 text-studio-gold dark:text-[#FDE047] text-[9px] font-mono tracking-widest uppercase font-bold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>HARMONIC RESONATOR</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-studio-maroon dark:text-[#FDE047] leading-tight mt-0.5">
            Holographic AI Orb
          </h3>
          <p className="text-[11px] text-studio-textSec dark:text-white/90">
            Voice-controlled crystalline visualizer with multi-axis counter-rotating gyro rings.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
          {/* Main 3D Canvas (8 cols) — Dark rounded cinematic viewport */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-[rgba(84,28,45,0.14)] dark:border-[rgba(235,220,203,0.15)] shadow-xl h-full min-h-0 flex items-center justify-center bg-gradient-to-b from-[#14181B]/90 via-[#1E2328]/90 to-[#0E1214]/95 backdrop-blur-xl cursor-grab active:cursor-grabbing select-none">
            
            {/* Ambient Radial Spotlight */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)]" />

            <Suspense fallback={<div className="text-xs font-mono text-studio-gold animate-pulse">Synthesizing 3D Orb...</div>}>
              <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
                <ambientLight intensity={1.3} />
                <pointLight position={[5, 5, 5]} intensity={2.5} color="#FFF8EB" />
                <pointLight position={[-5, -4, -4]} intensity={1.8} color="#7C263D" />
                <pointLight position={[0, 3, -2]} intensity={1.5} color="#38BDF8" />
                <OrbMesh frequency={frequency} isPulsing={isPulsing} />
                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enableRotate={true}
                  enablePan={true}
                  enableDamping={true}
                  dampingFactor={0.06}
                  minDistance={2.0}
                  maxDistance={12.0}
                  makeDefault
                />
              </Canvas>
            </Suspense>

            {/* Top Interactive Label */}
            <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-studio-teal animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-studio-gold dark:text-[#FDE047] font-bold uppercase">
                SPATIAL HARMONIC ENGINE • 360° ORBIT
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
              <Activity className="w-3 h-3 text-studio-gold dark:text-[#FDE047]" />
              <span>Resonance Frequency: <b className="text-studio-gold dark:text-[#FDE047]">{frequency} Hz</b></span>
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
                  Frequency Tuning
                </h4>
                <p className="text-xs text-studio-textSec dark:text-white/80 mt-0.5">Scale rotation velocity, core luminescence & nodes</p>
              </div>

              {/* Slider & Badge */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-studio-text dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                    Resonant Frequency
                  </span>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-studio-maroon text-white dark:bg-[#7C263D] dark:text-[#FEF08A] shadow-xs">
                    {frequency} Hz
                  </span>
                </div>

                <input
                  type="range"
                  min="100"
                  max="880"
                  value={frequency}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  onMouseUp={() => playClick()}
                  className="w-full accent-studio-maroon dark:accent-yellow-400 cursor-pointer h-2 bg-studio-maroon/20 dark:bg-white/20 rounded-lg"
                />

                <div className="flex justify-between text-[10px] font-mono text-studio-textSec dark:text-white/70 font-bold">
                  <span>100 Hz (Bass)</span>
                  <span className="text-studio-maroon dark:text-[#FDE047]">440 Hz (Concert A)</span>
                  <span>880 Hz (Soprano)</span>
                </div>
              </div>

              {/* Voice Physics Synthesizer Callout Box - Bright yellow/white in dark mode */}
              <div className="p-3.5 rounded-2xl bg-[rgba(181,138,82,0.06)] dark:bg-yellow-400/10 border border-[rgba(181,138,82,0.2)] dark:border-yellow-400/30 text-xs text-studio-text dark:text-white leading-relaxed">
                <span className="font-bold text-studio-maroon dark:text-[#FDE047] block mb-1">
                  ✦ Voice Physics Synthesizer:
                </span>
                Dictating frequency alterations dynamically adjusts rotational momentum, equatorial equalizer amplitudes, and core pulse luminescence.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-[rgba(84,28,45,0.08)] dark:border-white/10">
              <button
                onClick={handlePulse}
                className="w-full h-10 rounded-2xl bg-studio-maroon hover:bg-[#681F32] text-white dark:text-[#FEF08A] text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                <span>Trigger Resonance Pulse ({frequency} Hz)</span>
              </button>

              <button
                onClick={handleVoiceBeacon}
                className="w-full h-9 rounded-2xl bg-transparent hover:bg-studio-teal/10 border border-[rgba(84,28,45,0.16)] dark:border-white/20 text-studio-text dark:text-white hover:text-studio-teal dark:hover:text-[#FDE047] text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Radio className="w-3.5 h-3.5 text-studio-teal dark:text-[#FDE047]" />
                <span>Broadcast Voice Beacon</span>
              </button>

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
