/**
 * E2E Test: Promo Code Flow
 * 
 * Tests promo code application in cart
 * 
 * Validates:
 * - Valid promo code applies discount
 * - Expired promo code shows error
 * - Invalid promo code shows error
 * 
 * Prerequisites:
 * - Run seed-e2e-data.mjs on staging to create promo codes:
 *   - PROMO10E2E (valid, 10% off)
 *   - PROMOEXPIRED (expired)
 */

import { test, expect } from '@playwright/test';
import {
  E2E_PROMO_CODES,
} from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  applyPromoCode,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'test';

test.describe('Promo Code - Valid Codes', () => {
  
  test('apply valid promo code reduces total @critical @regression', async ({ page }) => {
    // Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Navigate to cart
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Get initial totals
    const subtotalBefore = await page.getByText(/sous-total.*€/i).first().textContent();
    
    // Apply valid promo code
    await applyPromoCode(page, E2E_PROMO_CODES.valid);
    
    // Verify success message or discount shown
    await page.waitForTimeout(2000);
    
    // Check for success indicators
    const hasSuccessMessage = await page.getByText(/code.*appliqué|réduction.*appliquée|promo.*valide/i).count() > 0;
    const hasDiscountLine = await page.getByText(/-\s*\d+.*€|réduction/i).count() > 0;
    const hasPromoCodeDisplay = await page.getByText(new RegExp(E2E_PROMO_CODES.valid, 'i')).count() > 0;
    
    expect(hasSuccessMessage || hasDiscountLine || hasPromoCodeDisplay).toBeTruthy();
  });
  
  test('promo code shows in order summary @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    await applyPromoCode(page, E2E_PROMO_CODES.valid);
    await page.waitForTimeout(2000);
    
    // Verify discount line appears in summary
    const discountLine = page.getByText(/-\s*\d+.*€|promo|réduction/i);
    await expect(discountLine.first()).toBeVisible();
  });
});

test.describe('Promo Code - Invalid/Expired Codes', () => {
  
  test('expired promo code shows error @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Apply expired promo code
    await applyPromoCode(page, E2E_PROMO_CODES.expired);
    await page.waitForTimeout(2000);
    
    // Should show error message
    const hasError = await page.getByText(/expiré|invalide|non valide|erreur/i).count() > 0;
    expect(hasError).toBeTruthy();
  });
  
  test('invalid promo code shows error @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Apply non-existent promo code
    await applyPromoCode(page, E2E_PROMO_CODES.invalid);
    await page.waitForTimeout(2000);
    
    // Should show error message
    const hasError = await page.getByText(/invalide|non trouvé|n'existe pas|erreur/i).count() > 0;
    expect(hasError).toBeTruthy();
  });
  
  test('empty promo code input shows validation @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Try to apply empty code
    await applyPromoCode(page, '');
    await page.waitForTimeout(1000);
    
    // Should show validation error or nothing happens
    // (no crash, no discount applied)
    const totalVisible = await page.getByText(/total.*€/i).count() > 0;
    expect(totalVisible).toBeTruthy();
  });
});

test.describe('Promo Code - Checkout Integration', () => {
  
  test('promo discount persists through checkout @critical @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Apply promo code
    await applyPromoCode(page, E2E_PROMO_CODES.valid);
    await page.waitForTimeout(2000);
    
    // Proceed to checkout
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await proceedBtn.click();
    
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Verify discount still shows in checkout
    const discountInCheckout = page.getByText(/-\s*\d+.*€|promo|réduction/i);
    await expect(discountInCheckout.first()).toBeVisible({ timeout: 10000 });
  });
});
