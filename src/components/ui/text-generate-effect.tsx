"use client";

import { useEffect, useRef, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  /** Delay between each word fade-in (seconds) */
  staggerDelay?: number;
}

/**
 * TextGenerateEffect — fades in words one by one when the element enters the viewport.
 * Uses pure CSS animations instead of motion/react to avoid pulling heavy JS into the critical path.
 * SSR-safe: renders all text in the DOM immediately for crawlers.
 */
export function TextGenerateEffect({
  words,
  className = "",
  staggerDelay = 0.08,
}: TextGenerateEffectProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use IntersectionObserver instead of motion's useInView
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-50px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const wordArray = words.split(" ");

  return (
    <span ref={ref} className={className}>
      {wordArray.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className="inline-block"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 0.4s ease-out ${idx * staggerDelay}s, transform 0.4s ease-out ${idx * staggerDelay}s`,
          }}
        >
          {word}
          {idx < wordArray.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
