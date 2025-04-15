"use client";
// import { cn } from "@/lib/utils";
import React from "react";
import { useId } from "react";
import { ShieldCheck, Truck, Leaf, Award } from 'lucide-react';

// Type pour nos avantages
type Benefit = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function StatsWithGridBackground() {
  // Liste des avantages
  const benefits: Benefit[] = [
    {
      id: '1',
      title: 'Produits 100% naturels',
      description: 'Tous nos produits sont issus d\'agriculture biologique, sans pesticides ni additifs.',
      icon: <Leaf className="h-6 w-6 text-white" />
    },
    {
      id: '2',
      title: 'Qualité garantie',
      description: 'Nos produits sont régulièrement testés en laboratoire pour garantir leur qualité et sécurité.',
      icon: <Award className="h-6 w-6 text-white" />
    },
    {
      id: '3',
      title: 'Livraison rapide',
      description: 'Expédition sous 24-48h pour toutes vos commandes en France métropolitaine.',
      icon: <Truck className="h-6 w-6 text-white" />
    },
    {
      id: '4',
      title: 'Paiement sécurisé',
      description: 'Vos transactions sont 100% sécurisées avec un système de paiement fiable.',
      icon: <ShieldCheck className="h-6 w-6 text-white" />
    }
  ];
  return (
    <section className=" py-20">
      <h2 className="text-3xl font-bold mb-10 text-center text-neutral-800 dark:text-neutral-200">Pourquoi nous choisir ?</h2>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="group/card relative overflow-hidden p-10 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <Grid size={20} />
              <EdgeElement />

              <div className="flex flex-col items-center text-center">
                <IconContainer>
                  {benefit.icon}
                </IconContainer>
                <h3 className="text-xl font-semibold mt-4 text-neutral-700 dark:text-neutral-200">
                  {benefit.title}
                </h3>
                <p className="text-balance mt-3 text-base text-neutral-600 dark:text-neutral-300">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const EdgeElement = () => {
  return (
    <div className="absolute right-0 top-0 h-10 w-10 overflow-hidden border-b border-l bg-white shadow-[-3px_4px_9px_0px_rgba(0,0,0,0.14)] transition duration-200 group-hover/card:-translate-y-14 group-hover/card:translate-x-14 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[-3px_4px_9px_0px_rgba(255,255,255,0.2)]">
      <div className="absolute left-0 top-0 h-[1px] w-[141%] origin-top-left rotate-45 bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
};
const IconContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-b from-neutral-200 to-white to-[50%] p-1 dark:from-neutral-800 dark:to-black">
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-b from-[#5D5D5D] to-black dark:to-neutral-900">
        {children}
      </div>
    </div>
  );
};

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/30 to-zinc-300/30 opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 dark:to-zinc-900/30">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full fill-black/10 stroke-black/10 mix-blend-overlay dark:fill-white/10 dark:stroke-white/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: {
  width: number;
  height: number;
  x: number | string;
  y: number | string;
  squares: number[][];
} & React.SVGProps<SVGSVGElement>) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
