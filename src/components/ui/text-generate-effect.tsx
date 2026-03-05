"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  /** Delay between each word fade-in (seconds) */
  staggerDelay?: number;
}

/**
 * TextGenerateEffect — fades in words one by one when the element enters the viewport.
 * Lightweight: uses only motion transforms + opacity (no canvas, no WebGL).
 * SSR-safe: renders all text in the DOM immediately for crawlers.
 */
export function TextGenerateEffect({
  words,
  className = "",
  staggerDelay = 0.08,
}: TextGenerateEffectProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView) setHasAnimated(true);
  }, [isInView]);

  const wordArray = words.split(" ");

  return (
    <span ref={ref} className={className}>
      {wordArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
          animate={
            hasAnimated
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(4px)", y: 8 }
          }
          transition={{
            duration: 0.4,
            delay: idx * staggerDelay,
            ease: "easeOut",
          }}
          className="inline-block"
          // SSR: text is always in the DOM
          style={{ willChange: "opacity, transform, filter" }}
        >
          {word}
          {idx < wordArray.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
