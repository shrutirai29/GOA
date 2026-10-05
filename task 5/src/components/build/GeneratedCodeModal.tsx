import React, { useState } from 'react';
import { Copy, X, Check, Code2 } from 'lucide-react';
import { playClick, playSuccess } from '../../lib/audio';

import { Generated3DExperience } from '../../types';

interface GeneratedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBuildItem: 'vip_pass' | 'orb' | 'custom' | 'none';
  customExperience?: Generated3DExperience | null;
  onToast: (msg: string) => void;
}

export const GeneratedCodeModal: React.FC<GeneratedCodeModalProps> = ({
  isOpen,
  onClose,
  activeBuildItem,
  customExperience,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'react' | 'three' | 'css'>('react');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const customSnippets = customExperience
    ? {
        react: `// React Three Fiber: ${customExperience.title}
// Generated for: "${customExperience.userPrompt}"
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

export const ${customExperience.title.replace(/[^a-zA-Z0-9]/g, '')}3D = () => (
  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
    <ambientLight intensity={0.9} />
    <directionalLight position={[5, 8, 5]} intensity={1.8} color="${customExperience.accentColor}" />
    <pointLight position={[-4, -2, -2]} intensity={1.2} color="${customExperience.glowColor}" />
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh castShadow receiveShadow>
        {/* Procedural ${customExperience.objectType} architecture */}
        <meshStandardMaterial
          color="${customExperience.primaryColor}"
          metalness={${customExperience.metalness}}
          roughness={${customExperience.roughness}}
        />
      </mesh>
    </Float>
    <OrbitControls enableDamping autoRotate autoRotateSpeed={1.5} />
  </Canvas>
);`,
        three: `// Three.js Procedural Mesh: ${customExperience.title}
import * as THREE from 'three';

const scene = new THREE.Scene();
const group = new THREE.Group();

// Archetype: ${customExperience.objectType}
const primaryMaterial = new THREE.MeshStandardMaterial({
  color: '${customExperience.primaryColor}',
  metalness: ${customExperience.metalness},
  roughness: ${customExperience.roughness}
});

const accentMaterial = new THREE.MeshStandardMaterial({
  color: '${customExperience.accentColor}',
  emissive: '${customExperience.glowColor}',
  emissiveIntensity: 0.4
});

// Add synthesized procedural geometry
const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32), primaryMaterial);
group.add(mesh);
scene.add(group);`,
        css: `/* Studio PBR Lighting & Atmosphere */
.${customExperience.objectType}-viewport {
  background: radial-gradient(circle at center, rgba(124, 38, 61, 0.15) 0%, transparent 70%);
  filter: drop-shadow(0 20px 40px ${customExperience.glowColor}33);
}`
      }
    : null;

  const snippets = {
    custom: customSnippets || {
      react: `// Custom 3D Component synthesized live`,
      three: `// Three.js custom geometry generated`,
      css: `/* Custom studio styling */`
    },
    vip_pass: {
      react: `// React Three Fiber VIP Pass Hero
import { Canvas } from '@react-three/fiber';
import { CardMesh } from './VipCardMesh';

export const VipPassHero = ({ isFlipped, theme }) => (
  <Canvas camera={{ position: [0, 0, 5.6], fov: 42 }}>
    <ambientLight intensity={1.3} />
    <directionalLight position={[5, 5, 5]} intensity={2.0} color="#FFF5EB" />
    <CardMesh isFlipped={isFlipped} theme={theme} mouseTilt={true} />
  </Canvas>
);`,
      three: `// Three.js High-Precision Mesh Creation
const geometry = new THREE.BoxGeometry(3.0, 1.88, 0.045);
const material = new THREE.MeshStandardMaterial({
  color: 0xb58a52,
  metalness: 0.7,
  roughness: 0.3
});
const passMesh = new THREE.Mesh(geometry, material);
passMesh.castShadow = true;
scene.add(passMesh);`,
      css: `/* Studio Glassmorphism & Lighting */
.vip-pass-container {
  background: rgba(255, 249, 241, 0.88);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(84, 28, 45, 0.1);
  box-shadow: 0 10px 35px rgba(84, 28, 45, 0.06);
}`
    },
    orb: {
      react: `// React Three Fiber Harmonic AI Orb
export const HolographicOrb = ({ freq = 440 }) => (
  <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
    <ambientLight intensity={1.1} />
    <OrbMesh frequency={freq} />
  </Canvas>
);`,
      three: `// Concentric Gyro Rings in Three.js
const ringGeom = new THREE.TorusGeometry(1.65, 0.025, 16, 100);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xb58a52, metalness: 0.8 });
const ringMesh = new THREE.Mesh(ringGeom, ringMat);
scene.add(ringMesh);`,
      css: `.orb-glow-core {
  background: radial-gradient(circle, #7c263d 0%, transparent 70%);
}`
    },
    none: {
      react: `// Speak a prompt with Wispr Flow to synthesize code!`,
      three: `// Three.js scene ready`,
      css: `/* Studio styling */`
    }
  }[activeBuildItem];

  const currentCode = snippets[activeTab];
  const lines = currentCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    playSuccess();
    onToast('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl glass-panel shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(84,28,45,0.08)] bg-[rgba(247,240,230,0.5)]">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-studio-maroon dark:text-studio-gold" />
            <h4 className="font-serif text-base font-bold text-studio-maroon dark:text-studio-gold">
              Generated Code
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            {(['react', 'three', 'css'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  playClick();
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition ${
                  activeTab === tab
                    ? 'bg-studio-maroon text-white font-semibold shadow-sm'
                    : 'text-studio-textSec hover:text-studio-text'
                }`}
              >
                {tab === 'react' ? 'React JSX' : tab === 'three' ? 'Three.js' : 'CSS'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-xl bg-studio-maroon text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-studio-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-studio-textSec hover:text-studio-maroon">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-5 bg-[#181215] text-[#F7F0E6] font-mono text-xs overflow-auto">
          <pre>
            {lines.map((line, idx) => (
              <div key={idx} className="flex leading-relaxed">
                <span className="w-8 select-none text-[#766B64] text-right pr-3 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[#EBDCCB] whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
