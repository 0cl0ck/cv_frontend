'use client';

import dynamic from 'next/dynamic';

// Dynamic imports with ssr: false — these components only run client-side
// and are not needed for initial paint (modals, floating widgets)
const AgeVerificationModal = dynamic(
  () => import('@/components/AgeVerificationModal/AgeVerificationModal'),
  { ssr: false }
);

const JanuaryBanner = dynamic(
  () => import('@/components/Christmas/JanuaryBanner'),
  { ssr: false }
);

const MobileBonusWidget = dynamic(
  () => import('@/components/Loyalty/MobileBonusWidget'),
  { ssr: false }
);

/**
 * Client wrapper for dynamically imported layout widgets.
 * These are loaded after hydration to reduce TBT:
 * - AgeVerificationModal: only shown once per visitor (cookie-gated)
 * - JanuaryBanner: seasonal promotional modal
 * - MobileBonusWidget: floating bonus tracker on mobile
 */
export default function DynamicWidgets() {
  return (
    <>
      <AgeVerificationModal />
      <JanuaryBanner />
      <MobileBonusWidget />
    </>
  );
}
