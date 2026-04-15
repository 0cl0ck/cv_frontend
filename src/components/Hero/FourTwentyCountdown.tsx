'use client';

import { useState, useEffect } from 'react';

// Date de début de la promo 4/20 (18 avril 2026 00:00 CEST)
const PROMO_START = new Date('2026-04-18T00:00:00+02:00').getTime();

function computeTimeLeft() {
  const diff = Math.max(0, PROMO_START - Date.now());
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="flex items-center justify-center w-11 h-11 md:w-13 md:h-13 rounded-lg bg-white/[0.08] border border-white/10 text-lg md:text-xl font-bold text-white tabular-nums"
        suppressHydrationWarning
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function FourTwentyCountdown() {
  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

  useEffect(() => {
    setTimeLeft(computeTimeLeft());

    const interval = setInterval(() => {
      const next = computeTimeLeft();
      setTimeLeft(next);

      if (next.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft.total <= 0) {
    return (
      <p className="text-center text-base md:text-lg font-bold text-[#EFC368]">
        C&apos;est parti ! 🔥
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-1.5 md:gap-2">
      <CountdownUnit value={timeLeft.days} label="jour" />
      <span className="text-white/25 text-base font-light mt-3">:</span>
      <CountdownUnit value={timeLeft.hours} label="heure" />
      <span className="text-white/25 text-base font-light mt-3">:</span>
      <CountdownUnit value={timeLeft.minutes} label="min" />
      <span className="text-white/25 text-base font-light mt-3">:</span>
      <CountdownUnit value={timeLeft.seconds} label="sec" />
    </div>
  );
}
