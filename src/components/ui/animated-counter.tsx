"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";

interface AnimatedCounterProps {
  /** The target value to count up to */
  value: number;
  /** Text to display before the number */
  prefix?: string;
  /** Text to display after the number */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** CSS class for the number */
  className?: string;
}

/**
 * AnimatedCounter — counts from 0 to target value when in viewport.
 * Uses motion's animate() for smooth easing. SSR renders final value.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.5,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [displayValue, setDisplayValue] = useState(value); // SSR: renders final value

  useEffect(() => {
    if (!isInView) return;

    // Animate from 0 to value
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  const formatted = displayValue.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
