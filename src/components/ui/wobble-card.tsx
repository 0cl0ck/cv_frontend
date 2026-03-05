"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";

interface WobbleCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees */
  maxRotation?: number;
}

/**
 * WobbleCard — subtle 3D tilt effect on mousemove.
 * Inspired by Aceternity UI's wobble-card.
 * Lightweight: CSS transforms only, no canvas.
 * Disabled on touch devices (no mousemove).
 */
export function WobbleCard({
  children,
  className = "",
  maxRotation = 2.5,
}: WobbleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setRotateX(-y * maxRotation);
    setRotateY(x * maxRotation);
  }

  function handleMouseLeave() {
    setRotateX(0);
    setRotateY(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "800px",
      }}
    >
      {children}
    </motion.div>
  );
}
