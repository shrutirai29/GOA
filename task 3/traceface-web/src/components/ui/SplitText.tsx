"use client";

import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function SplitText({ text, delay = 0, className = "" }: SplitTextProps) {
  const letters = text.split("");

  return (
    <span className={`inline-flex ${className}`} aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            delay: delay + i * 0.04,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", whiteSpace: letter === " " ? "pre" : "normal" }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}
