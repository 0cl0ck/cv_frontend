'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useId, type MouseEvent } from 'react';
import clsx from 'clsx';

import { useCartContext } from '@/context/CartContext';
import { GIFT_THRESHOLDS, GIFT_IDS } from '@/utils/gift-utils';

type BonusTier = {
  amount: number;
  label: string;
  description: string;
  totalGifts: number;
};

const BONUS_TIERS: BonusTier[] = [
  {
    amount: GIFT_THRESHOLDS.TIER_1,
    label: '2g offerts',
    description: 'A partir de 50 EUR de panier',
    totalGifts: 2,
  },
  {
    amount: GIFT_THRESHOLDS.TIER_2,
    label: '10g + 1 pre-roll',
    description: 'A partir de 90 EUR de panier',
    totalGifts: 10,
  },
  {
    amount: GIFT_THRESHOLDS.TIER_3,
    label: '20g + 2 pre-rolls',
    description: 'A partir de 160 EUR de panier',
    totalGifts: 20,
  },
];

const MAX_AMOUNT = GIFT_THRESHOLDS.TIER_3;

type GiftBreakdown = {
  grams: number;
  headline: string;
  perks: string[];
};

type MobileMenuToggleDetail = {
  open: boolean;
};

const GIFT_GRAMS: Record<string, number> = {
  [GIFT_IDS.TIER_1_2G]: 2,
  [GIFT_IDS.TIER_2_10G]: 10,
  [GIFT_IDS.TIER_3_20G]: 20,
  // Rétrocompatibilité avec les anciens IDs Halloween
  'gift-halloween-tier1-2g': 2,
  'gift-halloween-tier2-10g': 10,
  'gift-halloween-tier3-20g': 20,
};

function summarizeAutomaticGifts(
  gifts: Array<{ id: string; name: string; quantity: number }> | undefined | null,
): GiftBreakdown | null {
  if (!Array.isArray(gifts) || gifts.length === 0) {
    return null;
  }

  let grams = 0;
  for (const gift of gifts) {
    const quantity = Math.max(1, Number.isFinite(gift.quantity) ? gift.quantity : 1);
    const giftGrams = GIFT_GRAMS[gift.id as keyof typeof GIFT_GRAMS];
    if (giftGrams) {
      grams += giftGrams * quantity;
    }
  }

  const hasTier3 = gifts.some((gift) => gift.id === GIFT_IDS.TIER_3_20G);
  const hasTier2 = gifts.some((gift) => gift.id === GIFT_IDS.TIER_2_10G);
  const hasTier1 = gifts.some((gift) => gift.id === GIFT_IDS.TIER_1_2G);

  let headline = '';
  if (hasTier3) {
    headline = '20g + 2 pre-rolls offerts';
  } else if (hasTier2) {
    headline = '10g + 1 pre-roll offerts';
  } else if (hasTier1) {
    headline = '2g de fleurs CBD offerts';
  }

  const perks = gifts.map((gift) =>
    gift.quantity > 1 ? `${gift.name} x${gift.quantity}` : gift.name,
  );

  return {
    grams,
    headline,
    perks,
  };
}

function computeGifts(subtotal: number): GiftBreakdown {
  if (subtotal >= GIFT_THRESHOLDS.TIER_3) {
    return {
      grams: 20,
      headline: '20g + 2 pre-rolls offerts',
      perks: ['20g de fleurs CBD', '2 pre-rolls CBD'],
    };
  }

  if (subtotal >= GIFT_THRESHOLDS.TIER_2) {
    return {
      grams: 10,
      headline: '10g + 1 pre-roll offerts',
      perks: ['10g de fleurs CBD', '1 pre-roll CBD'],
    };
  }

  if (subtotal >= GIFT_THRESHOLDS.TIER_1) {
    return {
      grams: 2,
      headline: '2g de fleurs CBD offerts',
      perks: ['2g de fleurs CBD'],
    };
  }

  return { grams: 0, headline: '', perks: [] };
}

export default function MobileBonusWidget() {
  const { cart, isLoading, pricingTotals } = useCartContext();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const gradientId = useId();
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSubtotalRef = useRef<number>(0);
  const autoCloseRequestedRef = useRef(false);

  const netSubtotal = useMemo(() => {
    if (!pricingTotals) {
      return Math.max(0, cart?.subtotal ?? 0);
    }
    return Math.max(
      0,
      pricingTotals.subtotal -
        pricingTotals.siteDiscount -
        pricingTotals.loyaltyDiscount -
        pricingTotals.promoDiscount -
        pricingTotals.referralDiscount,
    );
  }, [pricingTotals, cart?.subtotal]);

  const backendGiftSummary = useMemo(
    () => summarizeAutomaticGifts(pricingTotals?.automaticGifts),
    [pricingTotals?.automaticGifts],
  );

  const gifts = useMemo(
    () => backendGiftSummary ?? computeGifts(netSubtotal),
    [backendGiftSummary, netSubtotal],
  );

  const _currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    []
  );

  const shouldHide =
    pathname?.startsWith('/panier') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/auth');

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    setIsMobileMenuOpen(document.body.classList.contains('mobile-menu-open'));

    if (typeof window === 'undefined') {
      return;
    }

    const handleMenuToggle = (event: Event) => {
      const customEvent = event as CustomEvent<MobileMenuToggleDetail>;
      setIsMobileMenuOpen(Boolean(customEvent.detail?.open));
    };

    window.addEventListener('mobile-menu-toggle', handleMenuToggle);

    return () => {
      window.removeEventListener('mobile-menu-toggle', handleMenuToggle);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    setIsExpanded(false);
    setIsMinimized(true);
    autoCloseRequestedRef.current = false;
    clearAutoCloseTimer();
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const previousSubtotal = prevSubtotalRef.current;
    if (!isMinimized && previousSubtotal <= 0 && netSubtotal > 0) {
      setIsExpanded(true);
      autoCloseRequestedRef.current = true; // Auto open only on first add
    }
    prevSubtotalRef.current = netSubtotal;
  }, [netSubtotal, isMinimized]);

  useEffect(() => {
    if (!isExpanded || isMinimized || !autoCloseRequestedRef.current) {
      return;
    }

    clearAutoCloseTimer();

    autoCloseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
      autoCloseRequestedRef.current = false;
    }, 5000);

    return () => {
      clearAutoCloseTimer();
    };
  }, [isExpanded, isMinimized]);

  useEffect(() => {
    if (!isExpanded || isMinimized) {
      return;
    }

    const handleScroll = () => {
      setIsExpanded(false);
      autoCloseRequestedRef.current = false;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isExpanded, isMinimized]);

  useEffect(() => {
    return () => {
      clearAutoCloseTimer();
    };
  }, []);

  if (isLoading || shouldHide) {
    return null;
  }

  const nextTier = BONUS_TIERS.find((tier) => netSubtotal < tier.amount);

  const remainingToNextTier = nextTier ? Math.max(0, nextTier.amount - netSubtotal) : 0;
  const additionalGifts = nextTier ? Math.max(0, nextTier.totalGifts - gifts.grams) : 0;
  const amountToFirstTier = Math.max(0, GIFT_THRESHOLDS.TIER_1 - netSubtotal);

  const headline =
    netSubtotal < GIFT_THRESHOLDS.TIER_1
      ? `+${Math.ceil(amountToFirstTier)}€ → 2g offerts`
      : nextTier
        ? `+${Math.ceil(remainingToNextTier)}€ → ${nextTier.label}`
        : 'Bonus max atteint ! 🎁';

  const detailLine =
    netSubtotal < GIFT_THRESHOLDS.TIER_1
      ? 'Montant calcule apres remise et fidelite'
      : gifts.grams > 0
        ? gifts.headline
        : 'Montant calcule apres remise et fidelite';

  const limitedSubtotal = Math.min(Math.max(netSubtotal, 0), MAX_AMOUNT);
  const progressPercent = Math.round((limitedSubtotal / MAX_AMOUNT) * 100);

  const handleToggle = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next) {
        autoCloseRequestedRef.current = false;
      }
      return next;
    });

    clearAutoCloseTimer();
  };

  const handleMinimize = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded(false);
    setIsMinimized(true);
    autoCloseRequestedRef.current = false;
    clearAutoCloseTimer();
  };

  const handleRestore = () => {
    if (isMobileMenuOpen) {
      return;
    }

    setIsMinimized(false);
    setIsExpanded(true);
    autoCloseRequestedRef.current = false;
    clearAutoCloseTimer();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 md:hidden transition-transform duration-300 ease-in-out">
        <button
          type="button"
          onClick={handleRestore}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#013032] text-emerald-200 shadow-2xl ring-2 ring-emerald-300/40 transition hover:bg-[#013b3d] focus:outline-none focus:ring-2 focus:ring-emerald-300/60 focus:ring-offset-2 focus:ring-offset-[#001a1b]"
          aria-label="Afficher le widget bonus"
        >
          <Image
            src="/images/gift-icon.png"
            alt="Cadeau"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-contain"
          />
          {gifts.grams > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-emerald-300 px-1.5 py-[1px] text-[11px] font-semibold text-[#02211f]">
              {gifts.grams}g
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center md:hidden">
      <div className="pointer-events-none w-full px-4">
        <div className="pointer-events-auto relative mx-auto max-w-md rounded-3xl border border-white/10 bg-[#032629]/95 text-white shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center gap-3 px-5 py-4 pr-14"
            aria-expanded={isExpanded}
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-emerald-400/15 text-sm font-semibold text-emerald-200">
              {gifts.grams > 0 ? `${gifts.grams}g` : '🎁'}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[13px] font-semibold text-white leading-tight">
                {headline}
              </span>
              <span className="text-[11px] text-emerald-200/80 leading-tight mt-0.5">{detailLine}</span>
              <div className="mt-3">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-100 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-white/60">
                  {BONUS_TIERS.map((tier) => {
                    const reached = netSubtotal >= tier.amount;
                    return (
                      <div key={tier.amount} className="flex flex-col items-center gap-1">
                        <div
                          className={clsx(
                            'h-2 w-2 rounded-full border border-white/30 transition-colors duration-200',
                            reached ? 'border-emerald-200 bg-emerald-300' : 'bg-white/20'
                          )}
                        />
                        <span>{tier.totalGifts}g</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="relative flex-none">
              <span className="bonus-widget-ring" aria-hidden>

                <svg className="bonus-widget-ring-svg" viewBox="0 0 40 40" role="presentation" focusable="false">

                  <defs>

                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">

                      <stop offset="0%" stopColor="rgba(239, 195, 104, 0.9)" />

                      <stop offset="45%" stopColor="rgba(239, 195, 104, 0.6)" />

                      <stop offset="75%" stopColor="rgba(239, 195, 104, 0.2)" />

                      <stop offset="100%" stopColor="rgba(239, 195, 104, 0)" />

                    </linearGradient>

                  </defs>

                  <circle

                    className="bonus-widget-ring-highlight"

                    cx="20"

                    cy="20"

                    r="18"

                    stroke={`url(#${gradientId})`}

                    strokeWidth="2"

                    strokeLinecap="round"

                    strokeDasharray="56.5 56.5"

                    strokeDashoffset="0"

                    fill="none"

                  />

                  <circle

                    cx="20"

                    cy="20"

                    r="18"

                    stroke="rgba(239, 195, 104, 0.18)"

                    strokeWidth="1"

                    fill="none"

                    opacity="0.35"

                  />

                </svg>

              </span>
              <div
                className={clsx(
                  'relative z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300',
                  isExpanded ? 'rotate-180' : 'rotate-0'
                )}
                aria-hidden
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                <path d="M6 9l6 6 6-6" />
              </svg>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleMinimize}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300/70 focus:ring-offset-2 focus:ring-offset-[#032629]"
            aria-label="Reduire le widget bonus"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>

          <div
            className={clsx(
              'grid overflow-hidden transition-all duration-300',
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="min-h-0 border-t border-white/10 px-5 pb-5 pt-4 text-sm text-white/80">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                <span>Votre progression</span>
                <span className="font-semibold text-emerald-200">{gifts.grams}g offerts</span>
              </div>
              {gifts.perks.length > 0 && (
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-xs text-white/70">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                    Cadeaux actuels
                  </p>
                  <ul className="space-y-1">
                    {gifts.perks.map((perk) => (
                      <li key={perk}>- {perk}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-3">
                {BONUS_TIERS.map((tier) => {
                  const reached = netSubtotal >= tier.amount;
                  const isNext = !reached && nextTier && nextTier.amount === tier.amount;
                  return (
                    <div
                      key={`${tier.amount}-${tier.totalGifts}`}
                      className={clsx(
                        'flex items-center gap-3 rounded-2xl border px-3 py-2 transition-all duration-200',
                        reached
                          ? 'border-emerald-400/60 bg-emerald-400/10'
                          : isNext
                            ? 'border-emerald-300/40 bg-white/5'
                            : 'border-white/10 bg-white/[0.03]'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-semibold',
                          reached
                            ? 'bg-emerald-300 text-[#02211f]'
                            : isNext
                              ? 'bg-emerald-400/15 text-emerald-200'
                              : 'bg-white/10 text-white/70'
                        )}
                      >
                        {reached ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M5 13l4 4 10-10" />
                          </svg>
                        ) : (
                          <span>{tier.totalGifts}g</span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-white">{tier.label}</span>
                        <span className="text-xs text-white/60">{tier.description}</span>
                      </div>
                      {isNext && additionalGifts > 0 && (
                        <span className="ml-auto rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                          +{additionalGifts}g
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Cashback de Noël - Période du 20-31 décembre */}
              <div className="mt-4 rounded-2xl border border-[#EFC368]/30 bg-gradient-to-r from-[#1a472a]/30 to-[#8B0000]/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💰</span>
                  <span className="text-xs font-semibold text-[#EFC368] uppercase tracking-wide">
                    Cashback Noël
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mb-2">
                  Bonus en cagnotte utilisable en janvier !
                </p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-black/20 rounded-lg py-1.5 px-1">
                    <p className="text-white text-[10px] font-medium">25€</p>
                    <p className="text-green-400 text-xs font-bold">→ 5€</p>
                  </div>
                  <div className="bg-black/20 rounded-lg py-1.5 px-1">
                    <p className="text-white text-[10px] font-medium">50€</p>
                    <p className="text-green-400 text-xs font-bold">→ 10€</p>
                  </div>
                  <div className="bg-black/20 rounded-lg py-1.5 px-1">
                    <p className="text-white text-[10px] font-medium">100€</p>
                    <p className="text-green-400 text-xs font-bold">→ 20€</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs text-white/60">
                <span>Cadeaux automatiquement ajoutes au panier.</span>
                <span>Livraison et codes promo compatibles.</span>
                <span>Montant calcule apres remises et fidelite.</span>
              </div>
              <Link
                href="/panier"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-emerald-300/60 bg-emerald-400/10 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Voir le panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
