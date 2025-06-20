'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface LazyLoadSectionProps {
  /**
   * Component to load lazily when user scrolls to this section
   */
  component: React.ComponentType<Record<string, unknown>>;
  /**
   * Props to pass to the lazy-loaded component
   */
  componentProps?: Record<string, unknown>;
  /**
   * Placeholder to show while component is loading
   */
  placeholder?: React.ReactNode;
  /**
   * Root margin for the IntersectionObserver (default: "100px")
   */
  rootMargin?: string;
  /**
   * CSS classes to apply to the section container
   */
  className?: string;
}

/**
 * LazyLoadSection component that loads content only when it comes into viewport
 * This helps reduce initial JavaScript execution time and speeds up page load
 */
export default function LazyLoadSection({
  component,
  componentProps = {},
  placeholder,
  rootMargin = '100px',
  className = '',
}: LazyLoadSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Create the dynamic component only when needed
  const DynamicComponent = isVisible 
    ? dynamic(() => Promise.resolve(component), { 
        loading: () => <>{placeholder}</>,
        ssr: false // Disable SSR for this component to reduce server load
      })
    : null;

  useEffect(() => {
    // Skip if already loaded or if we're in SSR
    if (hasLoaded || typeof window === 'undefined') return;

    // Create an observer for this section
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When section enters viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          // Once loaded, no need to keep observing
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    // Get the DOM node using sectionRef
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, rootMargin]);

  // Use ref instead of ID to avoid duplicate IDs
  const sectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={sectionRef} className={className}>
      {isVisible && DynamicComponent ? (
        <DynamicComponent {...componentProps} />
      ) : (
        placeholder || <div className="min-h-[200px] animate-pulse bg-gray-800 rounded-md" />
      )}
    </div>
  );
}
