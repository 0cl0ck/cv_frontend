'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique du gestionnaire de consentement aux cookies
const CookieConsentManager = dynamic(
  () => import('./CookieConsentManager').then(mod => mod.CookieConsentManager),
  { ssr: false }
);

export const ClientCookieManager: React.FC = () => {
  // On utilise un état pour s'assurer que le composant n'est rendu que côté client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne rendre le composant que côté client
  if (!isClient) return null;

  return <CookieConsentManager />;
};
