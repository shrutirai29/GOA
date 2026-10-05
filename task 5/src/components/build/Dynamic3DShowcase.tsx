import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Code2, Tag, Layers, Sliders, Volume2, Download, Rotate3D } from 'lucide-react';
import { Generated3DExperience } from '../../types';
import { playClick, playSuccess } from '../../lib/audio';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface Dynamic3DShowcaseProps {
  experience: Generated3DExperience;
  onOpenCode: () => void;
  onToast: (msg: string) => void;
}

// -------------------------------------------------------------
// Procedural 3D Mesh Component tailored to the analyzed prompt
// -------------------------------------------------------------
const GenerativeObject: React.FC<{
  experience: Generated3DExperience;
  activeColorway: { primary: string; secondary: string; accent: string; glow: string };
  glowEnabled: boolean;
  wireframe: boolean;
}> = ({ experience, activeColorway, glowEnabled, wireframe }) => {
  const rootGroup = useRef<THREE.Group>(null);
  const part1Ref = useRef<THREE.Group>(null);
  const part2Ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rootGroup.current) return;
    // Gentle floating levitation
    rootGroup.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.06;

    if (part1Ref.current) {
      part1Ref.current.rotation.y += delta * 0.4;
    }
    if (part2Ref.current) {
      part2Ref.current.rotation.z += delta * 0.3;
    }
  });

  const { objectType } = experience;

  return (
    <group ref={rootGroup}>
      {/* 1. WATCH / CHRONOMETER */}
      {objectType === 'watch' && (
        <group rotation={[0.3, 0.4, 0]}>
          {/* Main Watch Case */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.35, 48]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.92}
              roughness={0.18}
              wireframe={wireframe}
            />
          </mesh>

          {/* Golden Bezel Ring */}
          <mesh position={[0, 0.18, 0]}>
            <torusGeometry args={[1.48, 0.08, 16, 48]} />
            <meshStandardMaterial color={activeColorway.accent} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Watch Dial Face */}
          <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.35, 48]} />
            <meshStandardMaterial color={activeColorway.secondary} roughness={0.3} metalness={0.5} />
          </mesh>

          {/* Hour & Minute Hands */}
          <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0.8]}>
            <boxGeometry args={[0.08, 0.9, 0.02]} />
            <meshStandardMaterial color={activeColorway.accent} emissive={activeColorway.glow} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 2.3]}>
            <boxGeometry args={[0.05, 1.15, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          {/* Crown Button on Side */}
          <mesh position={[1.58, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
            <meshStandardMaterial color={activeColorway.accent} metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Upper Watch Band Links */}
          <mesh position={[0, 0.05, -1.9]}>
            <boxGeometry args={[1.1, 0.22, 1.2]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.88} roughness={0.25} />
          </mesh>
          {/* Lower Watch Band Links */}
          <mesh position={[0, 0.05, 1.9]}>
            <boxGeometry args={[1.1, 0.22, 1.2]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.88} roughness={0.25} />
          </mesh>
        </group>
      )}

      {/* 2. SWORD / BLADE */}
      {objectType === 'sword' && (
        <group rotation={[0.2, 0.3, 0.75]}>
          {/* Energy Blade Core */}
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.16, 3.2, 0.04]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={glowEnabled ? 2.5 : 0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Outer Prismatic Edge */}
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.26, 3.22, 0.06]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.9}
              roughness={0.2}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Crossguard Wings */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.3, 0.18, 0.3]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} roughness={0.2} />
          </mesh>

          {/* Handle Grip */}
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.1, 24]} />
            <meshStandardMaterial color={activeColorway.secondary} roughness={0.6} metalness={0.4} />
          </mesh>

          {/* Pommel Gemstone */}
          <mesh position={[0, -1.35, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={glowEnabled ? 2.0 : 0.5}
            />
          </mesh>
        </group>
      )}

      {/* 3. DRONE / SPACESHIP */}
      {objectType === 'drone' && (
        <group rotation={[0.3, 0.4, 0]}>
          {/* Central Aerodynamic Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.8, 1.2, 0.45, 32]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.9}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>

          {/* Sensor Visor Cockpit Dome */}
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={1.4}
              roughness={0.1}
            />
          </mesh>

          {/* 4 Outrigger Thruster Pods */}
          {[
            [1.5, 0, 1.5],
            [-1.5, 0, 1.5],
            [1.5, 0, -1.5],
            [-1.5, 0, -1.5]
          ].map((pos, i) => (
            <group key={i} position={pos as [number, number, number]}>
              <mesh>
                <torusGeometry args={[0.45, 0.08, 16, 32]} />
                <meshStandardMaterial color={activeColorway.secondary} metalness={0.8} />
              </mesh>
              {/* Glowing Jet Plasma Ring */}
              <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
                <meshBasicMaterial color={activeColorway.glow} transparent opacity={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 4. PERFUME / BOTTLE */}
      {objectType === 'bottle' && (
        <group position={[0, -0.4, 0]}>
          {/* Crystal Glass Body */}
          <mesh castShadow>
            <boxGeometry args={[1.8, 2.2, 1.1]} />
            <meshPhysicalMaterial
              color={activeColorway.accent}
              transmission={0.88}
              opacity={0.95}
              transparent
              roughness={0.06}
              ior={1.5}
            />
          </mesh>

          {/* Inner Liquid Core */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[1.5, 1.8, 0.85]} />
            <meshStandardMaterial
              color={activeColorway.secondary}
              emissive={activeColorway.primary}
              emissiveIntensity={0.6}
              roughness={0.1}
            />
          </mesh>

          {/* Golden Atomizer Neck */}
          <mesh position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.35, 24]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} roughness={0.12} />
          </mesh>

          {/* Faceted Stopper Cap */}
          <mesh position={[0, 1.7, 0]}>
            <octahedronGeometry args={[0.48, 1]} />
            <meshPhysicalMaterial
              color={activeColorway.primary}
              metalness={0.8}
              roughness={0.1}
              transmission={0.4}
              transparent
            />
          </mesh>
        </group>
      )}

      {/* 5. FLOWER / LOTUS */}
      {objectType === 'flower' && (
        <group ref={part1Ref} rotation={[0.4, 0, 0]}>
          {/* Glowing Center Pistil */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.45, 24, 24]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={glowEnabled ? 2.0 : 0.8}
            />
          </mesh>

          {/* 8 Outer Petals */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 1.1, 0.15, Math.sin(angle) * 1.1]}
                rotation={[0.3 * Math.sin(angle), angle, 0.3 * Math.cos(angle)]}
              >
                <coneGeometry args={[0.5, 1.5, 16]} />
                <meshStandardMaterial
                  color={activeColorway.primary}
                  roughness={0.3}
                  metalness={0.4}
                />
              </mesh>
            );
          })}

          {/* Base Calyx Ring */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.9, 0.5, 0.3, 24]} />
            <meshStandardMaterial color={activeColorway.secondary} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* 6. TROPHY / MONUMENT */}
      {objectType === 'trophy' && (
        <group position={[0, -0.5, 0]}>
          {/* Marble Plinth Base */}
          <mesh position={[0, -0.8, 0]}>
            <cylinderGeometry args={[1.3, 1.5, 0.45, 32]} />
            <meshStandardMaterial color="#1A1819" roughness={0.2} metalness={0.5} />
          </mesh>

          {/* Golden Cup Base Stem */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.25, 0.5, 0.8, 24]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Sculptural Cup Body */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[1.1, 0.45, 1.2, 32]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.96}
              roughness={0.12}
            />
          </mesh>

          {/* Victor Star Emblem */}
          <mesh position={[0, 1.45, 0]}>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      )}

      {/* 7. RING / DIAMOND JEWELRY */}
      {objectType === 'ring' && (
        <group rotation={[0.4, 0.5, 0]}>
          {/* Platinum / Gold Band */}
          <mesh>
            <torusGeometry args={[1.4, 0.22, 24, 64]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.98}
              roughness={0.08}
            />
          </mesh>

          {/* Elevated 4-Prong Setting */}
          <mesh position={[0, 1.55, 0]}>
            <cylinderGeometry args={[0.4, 0.25, 0.35, 16]} />
            <meshStandardMaterial color={activeColorway.accent} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Brilliant Solitaire Diamond */}
          <mesh position={[0, 1.95, 0]}>
            <octahedronGeometry args={[0.65, 1]} />
            <meshPhysicalMaterial
              color="#FFFFFF"
              emissive={activeColorway.glow}
              emissiveIntensity={0.5}
              transmission={0.92}
              roughness={0.04}
              ior={2.4}
              transparent
            />
          </mesh>
        </group>
      )}

      {/* 8. HELMET / CYBER VISOR */}
      {objectType === 'helmet' && (
        <group rotation={[0.2, 0.3, 0]}>
          {/* Armor Shell Head */}
          <mesh>
            <sphereGeometry args={[1.4, 32, 32]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.92}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>

          {/* Cyber Visor Shield */}
          <mesh position={[0, 0.1, 1.05]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[1.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={activeColorway.secondary}
              emissive={activeColorway.glow}
              emissiveIntensity={glowEnabled ? 2.2 : 0.8}
              roughness={0.1}
            />
          </mesh>

          {/* Ear Exhaust Discs */}
          <mesh position={[1.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 24]} />
            <meshStandardMaterial color={activeColorway.accent} metalness={0.9} />
          </mesh>
          <mesh position={[-1.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 24]} />
            <meshStandardMaterial color={activeColorway.accent} metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 9. TECH HARDWARE / SPEAKER */}
      {objectType === 'tech' && (
        <group rotation={[0.2, 0.4, 0]}>
          {/* Main Enclosure */}
          <mesh>
            <cylinderGeometry args={[1.3, 1.3, 2.2, 48]} />
            <meshStandardMaterial
              color={activeColorway.secondary}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Gold Accent Rings */}
          <mesh position={[0, 0.7, 0]}>
            <torusGeometry args={[1.32, 0.05, 16, 48]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <torusGeometry args={[1.32, 0.05, 16, 48]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} />
          </mesh>

          {/* Top Control Dial */}
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
            <meshStandardMaterial color={activeColorway.primary} metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Illuminated Acoustic Core */}
          <mesh position={[0, 0, 1.25]}>
            <sphereGeometry args={[0.4, 24, 24]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      )}

      {/* 10. ABSTRACT KINETIC SCULPTURE (Default for any creative prompt) */}
      {objectType === 'abstract' && (
        <group>
          {/* Central Hyper-Icosahedron Core */}
          <mesh>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial
              color={activeColorway.primary}
              metalness={0.88}
              roughness={0.15}
              wireframe={wireframe}
            />
          </mesh>

          {/* Inner Radiant Plasma Sun */}
          <mesh>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshStandardMaterial
              color={activeColorway.accent}
              emissive={activeColorway.glow}
              emissiveIntensity={glowEnabled ? 2.4 : 1.0}
            />
          </mesh>

          {/* Outer Gyro Ring 1 */}
          <group ref={part1Ref}>
            <mesh>
              <torusGeometry args={[1.8, 0.04, 16, 64]} />
              <meshStandardMaterial color={activeColorway.accent} metalness={0.95} />
            </mesh>
          </group>

          {/* Outer Gyro Ring 2 */}
          <group ref={part2Ref}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[2.1, 0.035, 16, 64]} />
              <meshStandardMaterial color={activeColorway.secondary} metalness={0.85} />
            </mesh>
          </group>
        </group>
      )}

      {/* Dynamic Golden Pedestal & Contact Shadow */}
      <group position={[0, -1.5, 0]}>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.9, 2.1, 0.1, 48]} />
          <meshStandardMaterial color="#1B1518" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <ringGeometry args={[1.8, 1.88, 48]} />
          <meshBasicMaterial color={activeColorway.glow} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 32]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
};

export const Dynamic3DShowcase: React.FC<Dynamic3DShowcaseProps> = ({
  experience,
  onOpenCode,
  onToast
}) => {
  const [activeColorwayIdx, setActiveColorwayIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const controlsRef = useRef<any>(null);

  const activeColorway = experience.colorways[activeColorwayIdx] || experience.colorways[0];

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
      if (dist < 11) {
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

  return (
    <ErrorBoundary fallbackTitle="Procedural 3D Scene">
      <div className="h-full flex flex-col min-h-0 gap-2 overflow-hidden">
        {/* Top Header Pill & Title */}
        <div className="shrink-0 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[rgba(181,138,82,0.12)] dark:bg-yellow-400/20 border border-[rgba(181,138,82,0.25)] dark:border-yellow-400/40 text-studio-gold dark:text-[#FDE047] text-[9px] font-mono tracking-widest uppercase font-bold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI SYNTHESIZED • {experience.category.toUpperCase()}</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-black text-studio-maroon dark:text-[#FDE047] leading-tight mt-0.5">
            {experience.title}
          </h3>
          <p className="text-[11px] font-bold text-studio-textSec dark:text-white/90">
            Generated from: <span className="italic font-normal">"{experience.userPrompt}"</span>
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
          
          {/* Main 3D Canvas (8 cols) — Dark rounded cinematic viewport */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-[rgba(84,28,45,0.14)] dark:border-[rgba(235,220,203,0.15)] shadow-xl h-full min-h-0 flex items-center justify-center bg-gradient-to-b from-[#14181B]/95 via-[#1E2328]/95 to-[#0E1214]/98 backdrop-blur-xl cursor-grab active:cursor-grabbing select-none">
            
            {/* Ambient Radial Spotlight matching object glow */}
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-700"
              style={{
                background: `radial-gradient(circle at center, ${activeColorway.glow}22 0%, transparent 70%)`
              }}
            />

            <Suspense fallback={<div className="text-xs font-mono text-studio-gold animate-pulse">Sculpting Procedural 3D Assembly...</div>}>
              <Canvas camera={{ position: [0, 0.3, 5.5], fov: 42 }}>
                <ambientLight intensity={1.3} />
                <directionalLight position={[5, 6, 5]} intensity={2.6} color="#FFF8EB" />
                <directionalLight position={[-5, -3, -3]} intensity={1.4} color={activeColorway.accent} />
                <pointLight position={[0, 3, 3]} intensity={1.8} color={activeColorway.glow} />
                <pointLight position={[0, -2, 2]} intensity={1.1} color={activeColorway.secondary} />

                <GenerativeObject
                  experience={experience}
                  activeColorway={activeColorway}
                  glowEnabled={glowEnabled}
                  wireframe={wireframe}
                />

                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enableRotate={true}
                  enablePan={true}
                  enableDamping={true}
                  dampingFactor={0.06}
                  minDistance={2.0}
                  maxDistance={11.0}
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
                {experience.objectType.toUpperCase()} • 360° ORBIT
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
              <Tag className="w-3 h-3 text-studio-gold dark:text-[#FDE047]" />
              <span>Palette: <b className="text-studio-gold dark:text-[#FDE047]">{activeColorway.name}</b></span>
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
                  Customize Experience
                </h4>
                <p className="text-xs font-bold text-studio-textSec dark:text-white/80 mt-0.5">Live materials & spatial synthesis</p>
              </div>

              {/* Colorways */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-studio-textSec dark:text-[#FDE047] font-bold tracking-wider">
                  MATERIAL PALETTES
                </label>
                <div className="space-y-2">
                  {experience.colorways.map((cw, i) => (
                    <button
                      key={cw.name}
                      onClick={() => {
                        setActiveColorwayIdx(i);
                        playClick();
                      }}
                      className={`w-full py-2 px-3 text-left rounded-xl text-xs font-semibold flex items-center justify-between border transition ${
                        activeColorwayIdx === i
                          ? 'border-studio-maroon dark:border-yellow-400 bg-studio-maroon/10 dark:bg-yellow-400/15 text-studio-maroon dark:text-[#FDE047] shadow-xs font-bold'
                          : 'border-[rgba(84,28,45,0.1)] dark:border-white/20 bg-transparent text-studio-textSec dark:text-white hover:text-studio-maroon dark:hover:text-[#FDE047]'
                      }`}
                    >
                      <span>{cw.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: cw.primary }} />
                        <span className="w-3 h-3 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: cw.glow }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Synthesis Specs */}
              <div className="p-3 rounded-xl bg-[rgba(181,138,82,0.06)] dark:bg-yellow-400/10 border border-[rgba(181,138,82,0.18)] dark:border-yellow-400/30 space-y-1.5 text-xs">
                <div className="font-mono text-[10px] text-studio-gold dark:text-[#FDE047] uppercase font-bold">
                  ✦ Architectural Specs:
                </div>
                {experience.specs.map((spec, i) => (
                  <div key={i} className="text-[11px] font-bold text-studio-textSec dark:text-white/90 leading-tight">
                    • {spec}
                  </div>
                ))}
              </div>

              {/* Effects Toggles */}
              <div className="pt-2 border-t border-[rgba(84,28,45,0.08)] dark:border-white/10 space-y-2">
                <label className="text-[10px] font-mono uppercase text-studio-textSec dark:text-[#FDE047] font-bold tracking-wider block">
                  EFFECTS & PHYSICS
                </label>

                {/* Auto Rotate Turntable */}
                <div
                  onClick={() => {
                    setAutoRotate(!autoRotate);
                    playClick();
                  }}
                  className="flex items-center justify-between py-2 px-1 cursor-pointer group hover:bg-black/[0.02] dark:hover:bg-white/[0.05] rounded-lg transition"
                >
                  <span className="text-xs font-semibold text-studio-text dark:text-white group-hover:text-studio-maroon dark:group-hover:text-[#FDE047] flex items-center gap-2 transition">
                    <Rotate3D className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                    Auto Rotate Turntable
                  </span>
                  <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${autoRotate ? 'bg-studio-maroon dark:bg-yellow-400' : 'bg-black/20 dark:bg-white/20'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${autoRotate ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Glow Switch */}
                <div
                  onClick={() => {
                    setGlowEnabled(!glowEnabled);
                    playClick();
                  }}
                  className="flex items-center justify-between py-2 px-1 cursor-pointer group hover:bg-black/[0.02] dark:hover:bg-white/[0.05] rounded-lg transition"
                >
                  <span className="text-xs font-semibold text-studio-text dark:text-white group-hover:text-studio-maroon dark:group-hover:text-[#FDE047] flex items-center gap-2 transition">
                    <Sparkles className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                    Photorealistic Emissive Glow
                  </span>
                  <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${glowEnabled ? 'bg-studio-maroon dark:bg-yellow-400' : 'bg-black/20 dark:bg-white/20'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${glowEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Wireframe Switch */}
                <div
                  onClick={() => {
                    setWireframe(!wireframe);
                    playClick();
                  }}
                  className="flex items-center justify-between py-2 px-1 cursor-pointer group hover:bg-black/[0.02] dark:hover:bg-white/[0.05] rounded-lg transition"
                >
                  <span className="text-xs font-semibold text-studio-text dark:text-white group-hover:text-studio-maroon dark:group-hover:text-[#FDE047] flex items-center gap-2 transition">
                    <Layers className="w-3.5 h-3.5 text-studio-gold dark:text-[#FDE047]" />
                    Wireframe Topology
                  </span>
                  <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${wireframe ? 'bg-studio-maroon dark:bg-yellow-400' : 'bg-black/20 dark:bg-white/20'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${wireframe ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-2 border-t border-[rgba(84,28,45,0.08)] dark:border-white/10">
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
