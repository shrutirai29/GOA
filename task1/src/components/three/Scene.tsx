"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function Rig({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // Listen on the window — the canvas sits behind content, so R3F's own
  // pointer state would never update.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    const { x, y } = pointer.current;
    const targetX = y * 0.16;
    const targetY = x * 0.24;
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetX, 2.2, delta);
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetY, 2.2, delta);
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, 0.4, 1.6, delta);
  });

  return <group ref={ref}>{children}</group>;
}

/* Golden Goa sun — the hero's centerpiece, warm and glowing. */
function SunSphere({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * 0.06;
  });

  return (
    <Float
      speed={reduced ? 0 : 0.9}
      rotationIntensity={reduced ? 0 : 0.18}
      floatIntensity={reduced ? 0 : 0.5}
    >
      {/* soft outer glow disc */}
      <mesh position={[0, 0.15, -0.4]} scale={mobile ? 2.7 : 3.6}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#f5c542" transparent opacity={reduced ? 0.06 : 0.1} />
      </mesh>
      {/* the sun itself */}
      <mesh ref={ref} position={[0, 0.15, 0]} scale={mobile ? 1.9 : 2.5}>
        <icosahedronGeometry args={[1, mobile ? 12 : 24]} />
        <MeshDistortMaterial
          color="#f7c948"
          emissive="#f5a623"
          emissiveIntensity={reduced ? 0.5 : 1.15}
          roughness={0.35}
          metalness={0.15}
          distort={reduced ? 0 : 0.18}
          speed={1.2}
        />
      </mesh>
      {/* warm inner core */}
      <mesh position={[0, 0.15, 0.15]} scale={0.72}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial color="#ffe9a8" transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

/* Floating palm leaves drifting through the scene — thematic, not random. */
function makeLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.42, 0.28, 0.46, 0.82, 0, 1);
  shape.bezierCurveTo(-0.46, 0.82, -0.42, 0.28, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 8);
  geo.translate(0, -0.5, 0);
  return geo;
}

const LEAF_COLORS = ["#1f7a45", "#2a9d5f", "#17603a", "#1e8c54", "#2dd4bf"];

interface LeafSpec {
  id: number;
  pos: [number, number, number];
  scale: number;
  rot: [number, number, number];
  speed: number;
  phase: number;
  color: string;
}

// Generated once at module scope (client-only module) — keeps render pure.
function makeLeaves(count: number): LeafSpec[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    pos: [
      (Math.random() - 0.5) * 11,
      (Math.random() - 0.5) * 6,
      -2 - Math.random() * 4,
    ],
    scale: 0.5 + Math.random() * 0.8,
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    speed: 0.12 + Math.random() * 0.25,
    phase: Math.random() * Math.PI * 2,
    color: LEAF_COLORS[i % LEAF_COLORS.length],
  }));
}

const DESKTOP_LEAVES = makeLeaves(9);
const MOBILE_LEAVES = makeLeaves(5);
const LEAF_GEOMETRY = makeLeafGeometry();

function Leaves({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const leaves = mobile ? MOBILE_LEAVES : DESKTOP_LEAVES;
  const geo = LEAF_GEOMETRY;

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current || reduced) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const l = leaves[i];
      child.rotation.z = l.rot[2] + Math.sin(t * l.speed + l.phase) * 0.35;
      child.rotation.x = l.rot[0] + Math.sin(t * l.speed * 0.7 + l.phase) * 0.2;
      child.position.y = l.pos[1] + Math.sin(t * l.speed + l.phase) * 0.6;
      child.position.x = l.pos[0] + Math.cos(t * l.speed * 0.5 + l.phase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {leaves.map((l) => (
        <mesh key={l.id} position={l.pos} rotation={l.rot} scale={l.scale}>
          <primitive object={geo} attach="geometry" />
          <meshBasicMaterial color={l.color} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 5, 5]} intensity={70} color="#f5c542" distance={22} />
      <pointLight position={[-5, -3, 3]} intensity={35} color="#2dd4bf" distance={20} />
      <pointLight position={[0, 4, -5]} intensity={25} color="#34d399" distance={18} />
    </>
  );
}

export default function Scene({ reduced }: { reduced: boolean }) {
  // This component is only mounted client-side (dynamic import, ssr: false),
  // so checking WebGL support synchronously here is safe.
  const [webglOk] = useState(() => {
    if (typeof document === "undefined") return true;
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  });

  const mobile = useMemo(
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false),
    [],
  );

  if (!webglOk) return null; // caller renders its own static fallback

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 6], fov: 42 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Rig reduced={reduced}>
        <Lights />
        <SunSphere reduced={reduced} mobile={mobile} />
        <Leaves reduced={reduced} mobile={mobile} />
        <Sparkles
          count={mobile ? 110 : 380}
          scale={mobile ? 9 : 15}
          size={2}
          speed={reduced ? 0 : 0.3}
          opacity={0.5}
          color="#a7f3d0"
        />
        <Sparkles
          count={mobile ? 40 : 130}
          scale={mobile ? 6 : 10}
          size={4}
          speed={reduced ? 0 : 0.16}
          opacity={0.22}
          color="#f5c542"
        />
      </Rig>
      {!reduced && (
        <Environment resolution={mobile ? 32 : 64} frames={1}>
          <Lightformer intensity={2.2} position={[0, 3, 4]} scale={[5, 5, 1]} color="#86efac" />
          <Lightformer intensity={1.4} position={[-4, -2, 2]} scale={[4, 4, 1]} color="#f5c542" />
          <Lightformer intensity={1.1} position={[4, 2, -2]} scale={[4, 4, 1]} color="#2dd4bf" />
        </Environment>
      )}
    </Canvas>
  );
}
