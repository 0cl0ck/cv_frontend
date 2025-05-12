'use client';

import React from 'react';
import { CookieBanner } from './CookieBanner';
import { CookieManager } from './CookieManager';
import { CookieConsentProvider } from '@/context/CookieConsentContext';

export const CookieConsentManager: React.FC = () => {
  return (
    <CookieConsentProvider>
      <CookieBanner />
      <CookieManager />
    </CookieConsentProvider>
  );
};
