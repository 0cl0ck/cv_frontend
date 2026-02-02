import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export { formatPrice } from './formatPrice';

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
    const theme = localStorage.getItem('theme') || 'dark';
    
    // Clear any existing theme classes
    htmlEl.classList.remove('light', 'dark');
    
    // Add the current theme class
    htmlEl.classList.add(theme);
  }
}
 
const HALLOWEEN_STORAGE_KEY = 'halloween-theme';

export function isHalloweenThemeActive(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const stored: string | null = localStorage.getItem(HALLOWEEN_STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  return document.documentElement.classList.contains('theme-halloween');
}

export function initHalloweenTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const htmlEl = document.documentElement;
  const stored: string | null = localStorage.getItem(HALLOWEEN_STORAGE_KEY);
  if (stored === 'true') {
    htmlEl.classList.add('theme-halloween');
  } else if (stored === 'false') {
    htmlEl.classList.remove('theme-halloween');
  }
}

export function toggleHalloweenTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const htmlEl = document.documentElement;
  const active = isHalloweenThemeActive();
  if (active) {
    htmlEl.classList.remove('theme-halloween');
    localStorage.setItem(HALLOWEEN_STORAGE_KEY, 'false');
  } else {
    htmlEl.classList.add('theme-halloween');
    localStorage.setItem(HALLOWEEN_STORAGE_KEY, 'true');
  }
}
