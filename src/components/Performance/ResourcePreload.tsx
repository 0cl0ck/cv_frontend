'use client';

import { useEffect } from 'react';

interface ResourcePreloadProps {
  resources: Array<{
    href: string;
    as: 'image' | 'style' | 'script' | 'font';
    type?: string;
    crossOrigin?: string;
    importance?: 'high' | 'low' | 'auto';
  }>;
}

/**
 * Component to preload critical resources for performance optimization
 * This helps reduce LCP time by loading critical resources earlier
 */
export default function ResourcePreload({ resources }: ResourcePreloadProps) {
  useEffect(() => {
    // Create and append preload links for critical resources
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      
      if (resource.type) {
        link.type = resource.type;
      }
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }
      
      if (resource.importance) {
        // Use setAttribute for non-standard or newer HTML attributes
        link.setAttribute('importance', resource.importance);
      }
      
      document.head.appendChild(link);
    });
    
    // Clean up function
    return () => {
      resources.forEach(resource => {
        const links = document.head.querySelectorAll(`link[rel="preload"][href="${resource.href}"]`);
        links.forEach(link => document.head.removeChild(link));
      });
    };
  }, [resources]);
  
  return null; // This component doesn't render anything
}
