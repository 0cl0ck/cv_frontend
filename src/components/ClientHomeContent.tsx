'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import client wrapper with no SSR to avoid server rendering issues
const ClientPageWrapper = dynamic(
  () => import("@/components/ClientPageWrapper"),
  { ssr: false }
);

export default function ClientHomeContent() {
  return <ClientPageWrapper />;
}
