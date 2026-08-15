"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  animate?: boolean;
}

/** Character-level staggered reveal with a 3D flip-in feel. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.028,
  animate = true,
}: SplitTextProps) {
  const reduce = useReducedMotion();

  if (!animate || reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: "inline-block", transformOrigin: "50% 100%" }}
          variants={{
            hidden: { y: "0.85em", opacity: 0, rotateX: -55 },
            visible: {
              y: 0,
              opacity: 1,
              rotateX: 0,
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}
