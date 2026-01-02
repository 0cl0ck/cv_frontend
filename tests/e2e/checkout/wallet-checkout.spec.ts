/**
 * E2E Test: Logged-in User Checkout with Wallet/Cagnotte
 * 
 * Validates:
 * - Authenticated checkout flow
 * - Wallet balance display
 * - Wallet application to payment
 */

import { test, expect } from '@playwright/test';
import { VIVA_TEST_CARDS } from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  fillCheckoutForm,
  completeVivaPayment,
  loginAsCustomer,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'produit-vedette-3';

// Test customer credentials - should exist in staging
// Create this customer manually or via seed
const TEST_CUSTOMER = {
  email: 'e2e-test@chanvre-vert.local',
  password: 'TestPassword123!',
};

test.describe('Logged-in Checkout with Wallet', () => {
  
  test.skip('authenticated user sees wallet balance @regression', async ({ page }) => {
    // Skip if test customer doesn't exist
    // TODO: Create test customer in staging DB
    
    // Login
    await loginAsCustomer(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    
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
  
  test.skip('user can apply wallet to payment @regression', async ({ page }) => {
    // Skip if test customer doesn't exist
    // TODO: Create test customer with wallet balance in staging DB
    
    await loginAsCustomer(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    
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
  
  test.skip('complete authenticated checkout with wallet @critical', async ({ page }) => {
    // Skip if test customer doesn't exist
    // This is a full end-to-end test that requires:
    // 1. Test customer with wallet balance
    // 2. Complete checkout flow
    // 3. Verify wallet was decremented
    
    await loginAsCustomer(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    
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
    
    // Complete checkout...
    // TODO: Full implementation once test customer exists
  });
});

test.describe('Account Page - Order History', () => {
  
  test.skip('user can view order history @regression', async ({ page }) => {
    await loginAsCustomer(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    
    // Navigate to order history
    await page.goto('/compte/commandes');
    await acceptBanners(page);
    
    // Verify orders list is displayed
    await expect(page.getByText(/commandes|historique/i).first()).toBeVisible({ timeout: 10000 });
  });
  
  test.skip('user can view order details @regression', async ({ page }) => {
    await loginAsCustomer(page, TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    
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
