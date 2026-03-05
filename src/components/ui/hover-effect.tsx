"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HoverEffectItem {
  id: string;
  content: React.ReactNode;
}

interface HoverEffectProps {
  items: HoverEffectItem[];
  className?: string;
  /** Color of the highlight background */
  highlightColor?: string;
}

/**
 * HoverEffect — a floating highlight that slides between items on hover.
 * Inspired by Aceternity UI's card-hover-effect.
 * Lightweight: CSS transforms only.
 */
export function HoverEffect({
  items,
  className = "",
  highlightColor = "rgba(0, 73, 66, 0.4)",
}: HoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={className}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 rounded-lg z-0"
                style={{ backgroundColor: highlightColor }}
                layoutId="hoverHighlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.4,
                }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
