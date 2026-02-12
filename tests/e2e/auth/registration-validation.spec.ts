/**
 * E2E Test: Registration Form Validation
 * 
 * Tests client-side validation and server error display on the registration form.
 * These tests do NOT create real accounts — they validate error UX only.
 */

import { test, expect } from '@playwright/test';
import { acceptBanners } from '../fixtures';

test.describe('Registration Validation Errors', () => {

  test.beforeEach(async ({ page }) => {
    // Pré-fermer la popup Valentine via localStorage AVANT navigation
    // Le composant JanuaryBanner vérifie 'valentine-modal-closed-2026' au mount
    await page.goto('/inscription');
    await page.evaluate(() => {
      localStorage.setItem('valentine-modal-closed-2026', 'true');
    });
    // Recharger pour que le composant lise le localStorage à jour
    await page.reload();

    await acceptBanners(page);

    // Attendre que le formulaire soit interactif
    await page.locator('button[type="submit"]').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('shows inline errors for empty form submission @regression', async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show inline errors under required fields
    await expect(page.locator('#firstName-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#lastName-error')).toBeVisible();
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#password-error')).toBeVisible();
    await expect(page.locator('#confirmPassword-error')).toBeVisible();

    // Check specific messages
    await expect(page.locator('#firstName-error')).toHaveText(/prénom.*requis/i);
    await expect(page.locator('#email-error')).toHaveText(/email.*requis/i);
    await expect(page.locator('#password-error')).toHaveText(/mot de passe.*requis/i);
  });

  test('validates email format @regression', async ({ page }) => {
    await page.fill('input[name="email"]', 'not-an-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('#email-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#email-error')).toHaveText(/email invalide/i);
  });

  test('validates password minimum length @regression', async ({ page }) => {
    await page.fill('input[name="password"]', 'Ab1');
    await page.click('button[type="submit"]');

    await expect(page.locator('#password-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#password-error')).toHaveText(/au moins 8 caractères/i);
  });

  test('validates password requires uppercase @regression', async ({ page }) => {
    await page.fill('input[name="password"]', 'abcdefgh1');
    await page.click('button[type="submit"]');

    await expect(page.locator('#password-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#password-error')).toHaveText(/majuscule/i);
  });

  test('validates password requires digit @regression', async ({ page }) => {
    await page.fill('input[name="password"]', 'Abcdefghij');
    await page.click('button[type="submit"]');

    await expect(page.locator('#password-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#password-error')).toHaveText(/chiffre/i);
  });

  test('validates password confirmation mismatch @regression', async ({ page }) => {
    await page.fill('input[name="password"]', 'ValidPass1');
    await page.fill('input[name="confirmPassword"]', 'Different1');
    await page.click('button[type="submit"]');

    await expect(page.locator('#confirmPassword-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#confirmPassword-error')).toHaveText(/ne correspondent pas/i);
  });

  test('validates GDPR consent required @regression', async ({ page }) => {
    // Fill all fields correctly but skip checkboxes
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'ValidPass1');
    await page.fill('input[name="confirmPassword"]', 'ValidPass1');

    await page.click('button[type="submit"]');

    // Should show errors for unchecked GDPR checkboxes
    await expect(page.locator('#termsAccepted-error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#privacyAccepted-error')).toBeVisible();
    await expect(page.locator('#termsAccepted-error')).toHaveText(/conditions générales/i);
  });

  test('clears field error when user corrects input @regression', async ({ page }) => {
    // Trigger email error
    await page.fill('input[name="email"]', 'bad');
    await page.click('button[type="submit"]');
    await expect(page.locator('#email-error')).toBeVisible({ timeout: 3000 });

    // Type a valid email — error should disappear
    await page.fill('input[name="email"]', 'valid@example.com');
    await expect(page.locator('#email-error')).not.toBeVisible();
  });

  test('shows red border on invalid fields @regression', async ({ page }) => {
    await page.click('button[type="submit"]');

    // The email input should have the error border class
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true', { timeout: 3000 });
  });

  test('no global error on client-side validation failures @regression', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Global error banner should NOT appear for client-side validation
    await expect(page.locator('[data-testid="global-error"]')).not.toBeVisible();

    // But inline errors should be visible
    await expect(page.locator('#firstName-error')).toBeVisible({ timeout: 3000 });
  });
});
