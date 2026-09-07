"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}

export function MagneticButton({
  children,
  onClick,
  variant = "primary",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.15);
    y.set((e.clientY - cy) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    variant === "primary"
      ? "inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-electric to-neon px-8 py-4 font-mono text-[13px] font-bold tracking-[0.18em] text-white shadow-[0_12px_40px_-10px_rgba(52,211,153,0.6)] transition-all hover:shadow-[0_16px_52px_-10px_rgba(52,211,153,0.85)]"
      : "inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-mono text-[13px] font-medium tracking-[0.14em] text-mist transition-all hover:border-electric/40 hover:text-bone";

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}
