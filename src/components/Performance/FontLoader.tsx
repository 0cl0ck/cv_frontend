'use client';

import React, { useEffect } from 'react';

/**
 * FontLoader component that applies font loading optimization strategies
 * 
 * This component implements:
 * 1. Font loading stage tracking in local storage
 * 2. FOUT optimization with font-display: swap
 * 3. Font preloading on first visit, then cached
 */
export default function FontLoader() {
  useEffect(() => {
    // Skip if document is not available (SSR)
    if (typeof document === 'undefined') return;

    // Check if this is first visit or fonts already cached
    const fontLoadState = localStorage.getItem('font-load-state');
    
    // Mark that we've visited before
    if (!fontLoadState) {
      localStorage.setItem('font-load-state', '1');
    }

    // This class will help us apply different font loading strategies
    document.documentElement.classList.add(
      fontLoadState ? 'fonts-stage-2' : 'fonts-stage-1'
    );
    
    // Font loading optimization class
    document.documentElement.classList.add('optimize-font-loading');

    // Apply the font-display loading preference to prevent FOIT (Flash of Invisible Text)
    const style = document.createElement('style');
    style.textContent = `
      /* Apply font-display: swap for all Google fonts to prevent FOIT */
      @font-face {
        font-family: 'Geist';
        font-display: swap !important;
      }
      @font-face {
        font-family: 'Geist Mono';
        font-display: swap !important;
      }
      
      /* Hide text briefly until fonts load on first visit */
      .fonts-stage-1 {
        transition: opacity 0.1s ease-in-out;
      }
      
      /* On subsequent visits, fonts are cached, so we can be more aggressive */
      .fonts-stage-2 {
        transition: none;
      }
      
      /* Both stages will get these benefits */
      .optimize-font-loading {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);
    
    // Font loading complete detection
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }, []);

  // This component doesn't render anything
  return null;
}
