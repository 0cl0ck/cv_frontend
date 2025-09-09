'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr: false - only allowed in client components
const ClientCookieManagerWrapper = dynamic(
  () => import('@/components/CookieConsent/ClientCookieManagerWrapper'),
  { ssr: false }
);

function ReferralTracker() {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const qs = typeof window !== 'undefined' ? window.location.search : '';
      if (!qs) return;
      const sp = new URLSearchParams(qs);
      const q = sp.get('ref') || sp.get('code') || sp.get('parrain') || '';
      const code = (q || '').trim();
      if (!code) return;
      if (trackedRef.current === code) return;
      trackedRef.current = code;
      // Fire-and-forget; cookie will be set if valid
      fetch(`/api/referral/track?code=${encodeURIComponent(code)}`, { method: 'POST' }).catch(() => {});
    } catch {
      // noop
    }
  }, []);

  return null;
}

/**
 * Client wrapper for layout components that need dynamic imports with ssr: false
 * This follows the three-layer Next.js 15+ pattern:
 * Server Component (layout.tsx) → Client Component (this file) → Dynamic import with ssr: false
 */
export default function ClientLayoutWrapper() {
  return (
    <>
      <ReferralTracker />
      <ClientCookieManagerWrapper />
    </>
  );
}
