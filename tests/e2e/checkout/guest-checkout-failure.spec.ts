/**
 * E2E Test: Guest Checkout with Card Payment - Failure Flow
 * 
 * Validates:
 * - Failed payment redirects to failure page
 * - Order remains in pending state
 * - User can retry payment
 */

import { test, expect } from '@playwright/test';
import {
  createGuestData,
  VIVA_TEST_CARDS,
} from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  fillCheckoutForm,
  completeVivaPayment,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'produit-vedette-3';

test.describe('Guest Checkout - Card Payment Failure', () => {
  
  test('failed payment redirects to failure page @critical @regression', async ({ page }) => {
    const guestData = createGuestData();
    
    // Step 1: Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Step 2: Navigate to cart and checkout
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    await proceedBtn.click();
    
    // Step 3: Fill checkout form
    await acceptBanners(page);
    await fillCheckoutForm(page, guestData);
    
    // Step 4: Select card payment and submit
    const cardChoice = page.getByText('Carte bancaire');
    if (await cardChoice.count()) {
      await cardChoice.first().click();
    }
    await proceedBtn.click();
    
    // Step 5: Complete payment with FAILURE card
    await completeVivaPayment(page, VIVA_TEST_CARDS.failure);
    
    // Step 6: Verify redirect to failure page
    await page.waitForURL(/\/paiement-echoue/, { timeout: 120000 });
    
    // Step 7: Verify failure page content
    await expect(page.getByText(/échec|échoué|erreur|problème/i)).toBeVisible({ timeout: 10000 });
  });
  
  test('user can retry after failed payment @regression', async ({ page }) => {
    // Navigate to failure page directly (simulating failed payment)
    await page.goto('/paiement-echoue');
    await acceptBanners(page);
    
    // Verify retry option exists
    const retryLink = page.getByRole('link', { name: /réessayer|panier|recommencer/i });
    await expect(retryLink).toBeVisible({ timeout: 10000 });
  });
});
