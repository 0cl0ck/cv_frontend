"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface HeroTextAnimatedProps {
  subtitle: string;
  title: string;
}

/**
 * Client wrapper for hero text animation.
 * The h1 tag stays in the server component for SEO.
 * This only handles the visual animation.
 */
export function HeroTextAnimated({ subtitle, title }: HeroTextAnimatedProps) {
  return (
    <>
      <span className="block md:whitespace-nowrap">
        <TextGenerateEffect words={subtitle} staggerDelay={0.06} />
      </span>
      <span className="block text-[#EFC368]">
        <TextGenerateEffect words={title} staggerDelay={0.06} />
      </span>
    </>
  );
}
