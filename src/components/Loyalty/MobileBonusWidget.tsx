'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useId, type MouseEvent } from 'react';
import clsx from 'clsx';

import { useCartContext } from '@/context/CartContext';
import { GIFT_THRESHOLDS } from '@/utils/gift-utils';

type BonusTier = {
  amount: number;
  label: string;
  description: string;
  totalGifts: number;
};

const BONUS_TIERS: BonusTier[] = [
  { amount: 0, label: '2g offerts', description: 'Ajoutez un produit au panier', totalGifts: 2 },
  { amount: GIFT_THRESHOLDS.TIER_0, label: '5g offerts', description: 'A partir de 50 EUR de panier', totalGifts: 5 },
  { amount: GIFT_THRESHOLDS.TIER_2, label: '15g offerts', description: 'A partir de 80 EUR de panier', totalGifts: 15 },
  { amount: GIFT_THRESHOLDS.TIER_3, label: '25g offerts', description: 'A partir de 160 EUR de panier', totalGifts: 25 },
];

const MAX_AMOUNT = GIFT_THRESHOLDS.TIER_3;

type GiftBreakdown = {
  baseGift: number;
  extraGift: number;
  totalGifts: number;
};

type MobileMenuToggleDetail = {
  open: boolean;
};

function computeGifts(subtotal: number): GiftBreakdown {
  if (subtotal <= 0) {
    return { baseGift: 0, extraGift: 0, totalGifts: 0 };
  }

  const baseGift = subtotal >= GIFT_THRESHOLDS.TIER_0 ? 5 : 2;
  const extraGift =
    subtotal >= GIFT_THRESHOLDS.TIER_3 ? 20 : subtotal >= GIFT_THRESHOLDS.TIER_2 ? 10 : 0;

  return { baseGift, extraGift, totalGifts: baseGift + extraGift };
}

export default function MobileBonusWidget() {
  const { cart, isLoading } = useCartContext();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const gradientId = useId();
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSubtotalRef = useRef<number>(0);
  const autoCloseRequestedRef = useRef(false);

  const subtotal = cart?.subtotal ?? 0;

  const gifts = useMemo(() => computeGifts(subtotal), [subtotal]);

  const currencyFormatter = useMemo(
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
    if (!isMinimized && previousSubtotal <= 0 && subtotal > 0) {
      setIsExpanded(true);
      autoCloseRequestedRef.current = true; // Auto open only on first add
    }
    prevSubtotalRef.current = subtotal;
  }, [subtotal, isMinimized]);

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

  const nextTier = subtotal <= 0
    ? BONUS_TIERS[0]
    : BONUS_TIERS.find((tier, index) => index > 0 && subtotal < tier.amount);

  const remainingToNextTier =
    nextTier && nextTier.amount > 0 ? Math.max(0, nextTier.amount - subtotal) : 0;
  const additionalGifts = nextTier ? Math.max(0, nextTier.totalGifts - gifts.totalGifts) : 0;

  const headline = subtotal <= 0
    ? 'Ajoutez un produit pour recevoir 2g offerts'
    : nextTier
      ? `Encore ${currencyFormatter.format(Math.ceil(remainingToNextTier))} -> +${additionalGifts}g offerts`
      : 'Bonus maximal atteint : 25g offerts';

  const detailLine = subtotal <= 0
    ? 'Offre valable sur toutes vos commandes'
    : `Total actuel : ${gifts.totalGifts}g offerts`;

  const limitedSubtotal = Math.min(Math.max(subtotal, 0), MAX_AMOUNT);
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
          {gifts.totalGifts > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-emerald-300 px-1.5 py-[1px] text-[11px] font-semibold text-[#02211f]">
              {gifts.totalGifts}g
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
              {gifts.totalGifts}g
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-white">
                {headline}
              </span>
              <span className="text-xs text-emerald-200/80">{detailLine}</span>
              <div className="mt-3">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-100 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-white/60">
                  {BONUS_TIERS.map((tier, index) => {
                    const reached = index === 0 ? subtotal > 0 : subtotal >= tier.amount;
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
                <span className="font-semibold text-emerald-200">
                  {gifts.totalGifts}g offerts
                </span>
              </div>
              <div className="space-y-3">
                {BONUS_TIERS.map((tier, index) => {
                  const reached = index === 0 ? subtotal > 0 : subtotal >= tier.amount;
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
              <div className="mt-5 flex flex-col gap-2 text-xs text-white/60">
                <span>Cadeaux automatiquement ajoutes au panier.</span>
                <span>Livraison et codes promo compatibles.</span>
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
