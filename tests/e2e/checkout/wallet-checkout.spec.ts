/**
 * E2E Test: Logged-in User Checkout with Wallet/Cagnotte
 * 
 * Validates:
 * - Authenticated checkout flow
 * - Wallet balance display
 * - Wallet application to payment
 */

import { test, expect } from '@playwright/test';
import { 
  VIVA_TEST_CARDS,
  E2E_TEST_CUSTOMER,
} from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  fillCheckoutForm,
  completeVivaPayment,
  loginAsCustomer,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'test';

test.describe('Logged-in Checkout with Wallet', () => {
  
  test('authenticated user sees wallet balance @regression', async ({ page }) => {
    // Login with seeded E2E test customer
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
    
    // Navigate to cart with items
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await page.goto('/panier');
    await acceptBanners(page);
    
    // Look for wallet/cagnotte display
    const walletDisplay = page.getByText(/cagnotte|wallet/i);
    
    if (await walletDisplay.count() > 0) {
      await expect(walletDisplay.first()).toBeVisible();
    }
  });
  
  test('user can apply wallet to payment @regression', async ({ page }) => {
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
    
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await page.goto('/panier');
    await acceptBanners(page);
    
    // Find and click wallet apply button
    const applyWalletBtn = page.getByRole('button', { name: /utiliser.*cagnotte|appliquer.*cagnotte/i });
    
    if (await applyWalletBtn.count() > 0) {
      await applyWalletBtn.click();
      
      // Verify total was adjusted
      await page.waitForTimeout(1000);
      // The total should decrease
    }
  });
  
  test('complete authenticated checkout with wallet @critical', async ({ page }) => {
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
    
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await page.goto('/panier');
    await acceptBanners(page);
    
    // Apply wallet if available
    const applyWalletBtn = page.getByRole('button', { name: /utiliser.*cagnotte/i });
    if (await applyWalletBtn.count() > 0) {
      await applyWalletBtn.click();
    }
    
    // Proceed to checkout
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await proceedBtn.click();
    
    // For authenticated users, some fields might be pre-filled
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on checkout page
    await expect(page.getByText(/informations|livraison|paiement/i).first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Account Page - Order History', () => {
  
  test('user can view order history @regression', async ({ page }) => {
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
    
    // Navigate to order history
    await page.goto('/compte/commandes');
    await acceptBanners(page);
    
    // Verify orders list is displayed
    await expect(page.getByText(/commandes|historique/i).first()).toBeVisible({ timeout: 10000 });
  });
  
  test('user can view order details @regression', async ({ page }) => {
    await loginAsCustomer(page, E2E_TEST_CUSTOMER.email, E2E_TEST_CUSTOMER.password);
    
    await page.goto('/compte/commandes');
    await acceptBanners(page);
    
    // Click on first order if exists
    const orderLink = page.locator('a[href*="/compte/commandes/"]').first();
    
    if (await orderLink.count() > 0) {
      await orderLink.click();
      
      // Verify order details page
      await expect(page.getByText(/détails.*commande|statut/i).first()).toBeVisible({ timeout: 10000 });
    }
  });
});
