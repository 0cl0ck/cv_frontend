'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyLoadSectionProps {
  component: React.ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  className?: string;
}

export default function LazyLoadSection({
  component,
  componentProps = {},
  placeholder,
  rootMargin = '100px',
  className = '',
}: LazyLoadSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender || typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, shouldRender]);

  const SectionComponent = component;

  return (
    <div ref={sectionRef} className={className}>
      {shouldRender ? (
        <SectionComponent {...componentProps} />
      ) : (
        placeholder || (
          <div className="min-h-[200px] animate-pulse bg-gray-800 rounded-md" />
        )
      )}
    </div>
  );
}
