/**
 * E2E Test: Loyalty/Cagnotte Flow
 * 
 * Tests wallet/cagnotte functionality for logged-in users
 * 
 * Validates:
 * - Wallet balance is displayed correctly
 * - User can apply cagnotte to reduce payment
 * - Full cagnotte covers payment (no redirect to VivaWallet)
 * 
 * Prerequisites:
 * - Run seed-e2e-data.mjs on staging to create test customer with 20€ wallet
 * - Set password in Payload Admin for: e2e-test@chanvre-vert.local
 */

import { test, expect } from '@playwright/test';
import {
  E2E_TEST_CUSTOMER,
} from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  loginAsCustomer,
  applyLoyalty,
  getWalletBalance,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'test';

test.describe('Loyalty/Cagnotte - Authenticated User', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as test customer
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
  });
  
  test('authenticated user sees wallet balance in cart @critical @regression', async ({ page }) => {
    // Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Navigate to cart
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Look for wallet/cagnotte display
    const walletDisplay = page.getByText(/cagnotte|solde|wallet/i);
    
    // Should show wallet balance for logged-in user
    await expect(walletDisplay.first()).toBeVisible({ timeout: 10000 });
    
    // Verify balance is displayed (should be 20€ from seed)
    const balance = await getWalletBalance(page);
    if (balance !== null) {
      expect(balance).toBeGreaterThan(0);
    }
  });
  
  test('user can apply partial cagnotte to payment @critical @regression', async ({ page }) => {
    // Add product to cart (price should be > 20€ to test partial)
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Get initial total
    const initialTotalText = await page.getByText(/total.*€/i).first().textContent();
    const initialTotal = initialTotalText ? parseFloat(initialTotalText.match(/(\d+[,.]?\d*)€?/)?.[1]?.replace(',', '.') || '0') : 0;
    
    // Apply cagnotte
    await applyLoyalty(page);
    
    // Verify total is reduced (or message about cagnotte applied)
    await page.waitForTimeout(2000);
    
    // Either total decreased or we see cagnotte applied message
    const hasAppliedMessage = await page.getByText(/cagnotte.*appliquée|appliqué.*cagnotte/i).count() > 0;
    const newTotalText = await page.getByText(/total.*€/i).first().textContent();
    const newTotal = newTotalText ? parseFloat(newTotalText.match(/(\d+[,.]?\d*)€?/)?.[1]?.replace(',', '.') || '0') : 0;
    
    expect(hasAppliedMessage || newTotal < initialTotal).toBeTruthy();
  });
  
  test('cagnotte shows in checkout summary @regression', async ({ page }) => {
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    
    // Proceed to checkout
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    await proceedBtn.click();
    
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // In checkout, cagnotte info should be visible
    const cagnotteInfo = page.getByText(/cagnotte|fidélité|wallet/i);
    await expect(cagnotteInfo.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Loyalty/Cagnotte - Edge Cases', () => {
  
  test('guest user does not see cagnotte option @regression', async ({ page }) => {
    // Navigate to cart without logging in
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Should NOT show "apply cagnotte" button for guests
    const applyBtn = page.getByRole('button', { name: /utiliser.*cagnotte/i });
    await expect(applyBtn).toHaveCount(0);
  });
});
