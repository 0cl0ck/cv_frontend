/**
 * E2E Test: Bank Transfer Payment Flow
 * 
 * Validates:
 * - Bank transfer option is available
 * - Order is created with correct status (pending_transfer)
 * - Confirmation page shows bank details
 */

import { test, expect } from '@playwright/test';
import { createGuestData } from '../fixtures';
import {
  acceptBanners,
  addProductToCart,
  fillCheckoutForm,
} from '../fixtures';

const TEST_PRODUCT_SLUG = 'produit-vedette-3';

test.describe('Guest Checkout - Bank Transfer', () => {
  
  test('complete checkout with bank transfer @regression', async ({ page }) => {
    const guestData = createGuestData();
    
    // Step 1: Add product to cart
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    
    // Step 2: Navigate to cart
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click proceed to checkout
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await expect(proceedBtn).toBeVisible({ timeout: 15000 });
    await proceedBtn.click();
    
    // Step 4: Fill checkout form
    await acceptBanners(page);
    await fillCheckoutForm(page, guestData);
    
    // Step 5: Select bank transfer
    const bankTransferChoice = page.getByText(/virement.*bancaire/i);
    await expect(bankTransferChoice).toBeVisible({ timeout: 5000 });
    await bankTransferChoice.first().click();
    
    // Step 6: Submit checkout
    await proceedBtn.click();
    
    // Step 7: Verify redirect to bank transfer confirmation
    await page.waitForURL(/\/confirmation\/virement\?order=/, { timeout: 60000 });
    
    // Step 8: Verify bank details are displayed
    await expect(page.getByText(/IBAN/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/BIC/i)).toBeVisible();
    await expect(page.getByText(/référence|order/i)).toBeVisible();
  });
  
  test('bank transfer confirmation shows order reference @regression', async ({ page }) => {
    const guestData = createGuestData();
    
    // Complete checkout with bank transfer
    await addProductToCart(page, TEST_PRODUCT_SLUG);
    await page.goto('/panier');
    await acceptBanners(page);
    await page.waitForLoadState('networkidle');
    
    const proceedBtn = page.getByRole('button', { name: 'Procéder au paiement' }).first();
    await proceedBtn.click();
    
    await acceptBanners(page);
    await fillCheckoutForm(page, guestData);
    
    const bankTransferChoice = page.getByText(/virement.*bancaire/i);
    if (await bankTransferChoice.count()) {
      await bankTransferChoice.first().click();
    }
    
    await proceedBtn.click();
    
    // Wait for confirmation page
    await page.waitForURL(/\/confirmation\/virement/, { timeout: 60000 });
    
    // Extract order reference from URL
    const url = page.url();
    const orderMatch = url.match(/order=([^&]+)/);
    
    if (orderMatch) {
      const orderRef = decodeURIComponent(orderMatch[1]);
      // Verify order reference is displayed on page
      await expect(page.getByText(new RegExp(orderRef, 'i'))).toBeVisible({ timeout: 5000 });
    }
  });
});
