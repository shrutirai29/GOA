"use client";

import type { ReactNode, MouseEventHandler } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Magnet } from "./Magnet";
import { ClickSpark } from "./ClickSpark";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();

  const base: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "14px 26px",
    borderRadius: 999,
    fontFamily: "var(--font-jetbrains)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    transition: "box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease",
    userSelect: "none",
  };

  const styles: React.CSSProperties =
    variant === "primary"
      ? {
          ...base,
          color: "#fff",
          background: "linear-gradient(120deg, #22c55e 0%, #34d399 55%, #2dd4bf 130%)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 8px 28px -8px rgba(52,211,153,0.65), inset 0 1px 0 rgba(255,255,255,0.25)",
        }
      : {
          ...base,
          color: "var(--color-bone)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(8px)",
        };

  return (
    <Magnet strength={0.22} className="inline-block">
      <ClickSpark>
        <motion.button
          type={type}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={onClick}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          className={className}
          style={{
            ...styles,
            ...(disabled ? { opacity: 0.5, pointerEvents: "none" } : {}),
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.boxShadow =
              variant === "primary"
                ? "0 12px 40px -6px rgba(52,211,153,0.9), inset 0 1px 0 rgba(255,255,255,0.3)"
                : "0 0 0 1px rgba(134,239,172,0.4), 0 12px 40px -12px rgba(52,211,153,0.5)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.boxShadow =
              variant === "primary"
                ? "0 8px 28px -8px rgba(52,211,153,0.65), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "0 0 0 0 rgba(134,239,172,0)";
          }}
        >
          {children}
        </motion.button>
      </ClickSpark>
    </Magnet>
  );
}
