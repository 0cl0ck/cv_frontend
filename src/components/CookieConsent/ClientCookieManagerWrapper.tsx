'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the cookie manager component with ssr: false
const DynamicCookieManager = dynamic(
  () => import("@/components/CookieConsent/ClientCookieManager").then((mod) => mod.ClientCookieManager),
  { ssr: false }
);

/**
 * Client component wrapper for the cookie manager
 * This allows us to use dynamic import with ssr: false
 */
export default function ClientCookieManagerWrapper() {
  return <DynamicCookieManager />;
}
