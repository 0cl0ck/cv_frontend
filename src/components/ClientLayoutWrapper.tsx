'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false - only allowed in client components
const ClientCookieManagerWrapper = dynamic(
  () => import('@/components/CookieConsent/ClientCookieManagerWrapper'),
  { ssr: false }
);

/**
 * Client wrapper for layout components that need dynamic imports with ssr: false
 * This follows the three-layer Next.js 15+ pattern:
 * Server Component (layout.tsx) → Client Component (this file) → Dynamic import with ssr: false
 */
export default function ClientLayoutWrapper() {
  return <ClientCookieManagerWrapper />;
}
