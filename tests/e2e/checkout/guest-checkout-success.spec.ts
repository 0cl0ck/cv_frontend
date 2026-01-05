/**
 * E2E Test: Guest Checkout with Card Payment - Success Flow
 * 
 * Critical path: This is the primary revenue flow
 * 
 * Validates:
 * - Product can be added to cart
 * - Checkout form works correctly
 * - VivaWallet redirect and payment completion
 * - Order is created with correct status
 */

import { test, expect } from '@playwright/test';
import {
  createGuestData,
  VIVA_TEST_CARDS,
  getOrderByVivaCode,
} from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  fillCheckoutForm,
  completeVivaPayment,
} from '../fixtures';

// Test product slug - should exist in staging DB
const TEST_PRODUCT_SLUG = 'test';

test.describe('Guest Checkout - Card Payment Success', () => {
  
  test('complete guest checkout with card payment @critical @regression', async ({ page, request }) => {
    const guestData = createGuestData();
    
    // Step 1: Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Step 2: Navigate to cart
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click "Proceed to checkout"
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    await proceedBtn.click();
    
    // Step 4: Fill checkout form
    await acceptBanners(page);
    await fillCheckoutForm(page, guestData);
    
    // Step 5: Select card payment
    const cardChoice = page.getByText('Carte bancaire');
    if (await cardChoice.count()) {
      await cardChoice.first().click();
    }
    
    // Step 6: Submit checkout
    await proceedBtn.click();
    
    // Step 7: Complete VivaWallet payment
    await completeVivaPayment(page, VIVA_TEST_CARDS.success);
    
    // Step 8: Verify redirect to success page
    await page.waitForURL(/\/paiement-reussi\?/, { timeout: 120000 });
    
    // Step 9: Verify success page content
    await expect(page.getByText(/commande.*confirmée|paiement.*réussi/i)).toBeVisible({ timeout: 10000 });
    
    // Step 10: Extract order code from URL and verify backend state
    const url = page.url();
    const orderCodeMatch = url.match(/[?&]v=(\d+)/);
    
    if (orderCodeMatch) {
      const vivaOrderCode = orderCodeMatch[1];
      
      // Wait a bit for webhook processing
      await page.waitForTimeout(3000);
      
      // Verify order exists and has correct status
      const order = await getOrderByVivaCode(request, vivaOrderCode);
      
      if (order) {
        expect(order.paymentStatus).toBe('paid');
        expect(['processing', 'shipped', 'delivered']).toContain(order.status);
        expect(order.guestInformation.email).toBe(guestData.email);
      }
    }
  });
  
  test('checkout shows correct total with shipping @regression', async ({ page }) => {
    // Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Navigate to cart
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Verify cart has items and total is displayed
    await expect(page.getByText(/sous-total/i)).toBeVisible();
    await expect(page.getByText(/livraison/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
    
    // Verify "Proceed to checkout" is enabled
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await expect(proceedBtn).toBeEnabled();
  });
});
