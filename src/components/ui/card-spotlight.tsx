"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  /** Spotlight color (CSS color string) */
  spotlightColor?: string;
  /** Spotlight size in pixels */
  spotlightSize?: number;
}

/**
 * CardSpotlight — a radial gradient glow that follows the cursor on hover.
 * Inspired by Aceternity UI's card-spotlight.
 * Lightweight: CSS radial-gradient only, no canvas.
 */
export function CardSpotlight({
  children,
  className = "",
  spotlightColor = "rgba(0, 73, 66, 0.25)",
  spotlightSize = 250,
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        animate={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
