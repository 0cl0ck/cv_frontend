/**
 * Page helpers and common actions for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Click a button/element only if it's visible within timeout
 */
export async function clickIfVisible(
  locator: ReturnType<Page['locator']>,
  timeout = 2000
): Promise<boolean> {
  try {
    await locator.first().waitFor({ state: 'visible', timeout });
    await locator.first().click({ trial: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Accept age verification, cookie banners, and close promotional popups
 */
export async function acceptBanners(page: Page): Promise<void> {
  // Age verification
  await clickIfVisible(
    page.getByRole('button', { name: "J'ai 18 ans ou plus" }),
    2500
  );
  // Cookie consent
  await clickIfVisible(
    page.getByRole('button', { name: /Tout accepter|Accepter tous les cookies/i }),
    2500
  );
  // New Year / promotional popup - try multiple selectors
  // Option 1: Click "Voir mes produits" button
  await clickIfVisible(
    page.locator('button:has-text("Voir mes produits")'),
    1500
  );
  // Option 2: Click close button (X)
  await clickIfVisible(
    page.locator('button:has(svg), button.close, [role="dialog"] button >> nth=0'),
    1000
  );
}

/**
 * Fill an input field that follows a label
 */
export async function fillByLabel(
  page: Page,
  labelText: RegExp,
  value: string
): Promise<void> {
  const input = page
    .locator('label')
    .filter({ hasText: labelText })
    .first()
    .locator('xpath=following-sibling::input[1]');
  await expect(input).toBeVisible();
  await input.fill(value);
}

/**
 * Select country in a dropdown
 */
export async function selectCountry(page: Page, country: string): Promise<void> {
  const select = page
    .locator('label')
    .filter({ hasText: /^Pays$/i })
    .first()
    .locator('xpath=following-sibling::select[1]');
  await expect(select).toBeVisible();
  await select.selectOption({ label: country });
}

/**
 * Wait for cart to have at least one item in localStorage
 */
export async function ensureCartHasItem(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      try {
        const raw = localStorage.getItem('chanvre_vert_cart');
        if (!raw) return false;
        const c = JSON.parse(raw);
        return Array.isArray(c.items) && c.items.length > 0;
      } catch {
        return false;
      }
    },
    null,
    { timeout: 10000 }
  );
}

/**
 * Add a product to cart from product page
 */
export async function addProductToCart(page: Page, productSlug: string): Promise<void> {
  await page.goto(`/produits/${productSlug}`);
  await acceptBanners(page);
  await page.waitForLoadState('networkidle');
  
  const addBtn = page.getByRole('button', { name: 'Ajouter au panier' }).first();
  await expect(addBtn).toBeVisible({ timeout: 15000 });
  await addBtn.click();
  await ensureCartHasItem(page);
}

/**
 * Fill guest checkout form with provided data
 */
export async function fillCheckoutForm(
  page: Page,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  }
): Promise<void> {
  await expect(page.getByText('Informations de contact')).toBeVisible({ timeout: 15000 });
  
  await fillByLabel(page, /^Prénom$/i, data.firstName);
  await fillByLabel(page, /^Nom$/i, data.lastName);
  await fillByLabel(page, /^Email$/i, data.email);
  await fillByLabel(page, /^Téléphone$/i, data.phone);
  await fillByLabel(page, /^Adresse$/i, data.address);
  await fillByLabel(page, /^Code Postal$/i, data.postalCode);
  await fillByLabel(page, /^Ville$/i, data.city);
  await selectCountry(page, data.country);
}

/**
 * Complete VivaWallet payment with test card
 */
export async function completeVivaPayment(
  page: Page,
  card: { number: string; cvv: string; expiry: string }
): Promise<void> {
  // Wait for VivaWallet checkout page
  await page.waitForURL(/https:\/\/demo\.vivapayments\.com\/.+/, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  
  // Fill card details
  await page.locator('#card-number').fill(card.number);
  await page.locator('#card-expiration').fill(card.expiry);
  await page.locator('#cvv').fill(card.cvv);
  
  // Submit payment
  await page.locator('#pay-btn-amount').click();
}

/**
 * Login as customer
 */
export async function loginAsCustomer(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/connexion');
  await acceptBanners(page);
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to account page
  await page.waitForURL(/\/compte/, { timeout: 15000 });
}

/**
 * Apply a promo code in cart page
 */
export async function applyPromoCode(page: Page, code: string): Promise<void> {
  // Look for promo code input
  const promoInput = page.locator('input[name="promoCode"], input[placeholder*="promo" i], input[placeholder*="code" i]').first();
  await expect(promoInput).toBeVisible({ timeout: 5000 });
  await promoInput.fill(code);
  
  // Click apply button
  const applyBtn = page.getByRole('button', { name: /appliquer|valider/i }).first();
  await applyBtn.click();
  
  await page.waitForTimeout(1000);
}

/**
 * Apply referral code in cart page
 */
export async function applyReferralCode(page: Page, code: string): Promise<void> {
  // Look for referral/parrainage input
  const referralInput = page.locator('input[name="referralCode"], input[placeholder*="parrain" i]').first();
  
  if (await referralInput.count() > 0) {
    await referralInput.fill(code);
    
    // Click apply button
    const applyBtn = page.locator('button').filter({ hasText: /appliquer|valider/i }).first();
    await applyBtn.click();
    
    await page.waitForTimeout(1000);
  }
}

/**
 * Apply loyalty/cagnotte to cart
 */
export async function applyLoyalty(page: Page): Promise<void> {
  // Look for "use cagnotte" button/checkbox
  const loyaltyBtn = page.getByRole('button', { name: /utiliser.*cagnotte|appliquer.*cagnotte/i }).first();
  const loyaltyCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /cagnotte/i }).first();
  
  if (await loyaltyBtn.count() > 0) {
    await loyaltyBtn.click();
  } else if (await loyaltyCheckbox.count() > 0) {
    await loyaltyCheckbox.check();
  }
  
  await page.waitForTimeout(1000);
}

/**
 * Get displayed wallet balance from page
 */
export async function getWalletBalance(page: Page): Promise<number | null> {
  const balanceText = page.locator('[data-testid="wallet-balance"], .wallet-balance, .cagnotte-balance').first();
  
  if (await balanceText.count() === 0) {
    // Try to find it in text
    const cagnotteText = await page.getByText(/cagnotte.*€|€.*cagnotte/i).first().textContent();
    if (cagnotteText) {
      const match = cagnotteText.match(/(\d+[,.]?\d*)\s*€/);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }
    return null;
  }
  
  const text = await balanceText.textContent();
  const match = text?.match(/(\d+[,.]?\d*)/);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

