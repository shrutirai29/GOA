"use client";

import { motion, useReducedMotion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

/**
 * Word-by-word blur + rise reveal. Words are ALWAYS visible (opacity 1) —
 * the blur is only a subtle polish, so the text can never get stuck
 * invisible if the in-view observer fails to fire on some device.
 */
export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  once = true,
}: BlurTextProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: "inline-block", opacity: 1 }}
          variants={{
            hidden: { opacity: 1, filter: "blur(6px)", y: 10 },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
