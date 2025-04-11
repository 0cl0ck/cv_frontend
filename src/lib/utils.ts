import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dark mode utility functions
export function toggleDarkMode() {
  const htmlEl = document.documentElement;
  if (htmlEl.classList.contains('dark')) {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

export function initDarkMode() {
  if (typeof window !== 'undefined') {
    const htmlEl = document.documentElement;
    const theme = localStorage.getItem('theme') || 'light';
    
    // Clear any existing theme classes
    htmlEl.classList.remove('light', 'dark');
    
    // Add the current theme class
    htmlEl.classList.add(theme);
  }
}

// Format price to Euro format
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}
