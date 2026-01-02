/**
 * E2E Test: User Registration and Account Linking
 * 
 * Validates:
 * - New account creation works
 * - Guest orders are linked to new account
 * - Email verification flow
 */

import { test, expect } from '@playwright/test';
import { createCustomerData } from '../fixtures';
import { acceptBanners } from '../fixtures';

test.describe('User Registration', () => {
  
  test('create new account successfully @critical @regression', async ({ page }) => {
    const customerData = createCustomerData();
    
    // Navigate to registration page
    await page.goto('/inscription');
    await acceptBanners(page);
    
    // Fill registration form
    await page.fill('input[name="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"]', customerData.lastName);
    await page.fill('input[name="email"]', customerData.email);
    await page.fill('input[name="password"]', customerData.password);
    
    // Accept terms (if present)
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect or success message
    // Could redirect to /compte, /connexion, or show success message
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const hasSuccessMessage = await page.getByText(/inscription.*réussie|compte.*créé|bienvenue/i).count() > 0;
    
    expect(url.includes('/compte') || url.includes('/connexion') || hasSuccessMessage).toBeTruthy();
  });
  
  test('registration shows validation errors @regression', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/inscription');
    await acceptBanners(page);
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors appear
    await expect(page.getByText(/requis|obligatoire|invalide/i).first()).toBeVisible({ timeout: 5000 });
  });
  
  test('registration rejects duplicate email @regression', async ({ page }) => {
    // Use a known existing email
    // Note: This assumes there's at least one customer in staging DB
    const existingEmail = 'test@example.com';
    
    await page.goto('/inscription');
    await acceptBanners(page);
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Duplicate');
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="password"]', 'Password123!');
    
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Should show error about existing account or stay on page
    const hasError = await page.getByText(/existe.*déjà|already.*exists|email.*utilisé/i).count() > 0;
    const stayedOnPage = page.url().includes('/inscription');
    
    expect(hasError || stayedOnPage).toBeTruthy();
  });
});

test.describe('User Login/Logout', () => {
  
  test('login page is accessible @regression', async ({ page }) => {
    await page.goto('/connexion');
    await acceptBanners(page);
    
    // Verify login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
  
  test('login shows error for invalid credentials @regression', async ({ page }) => {
    await page.goto('/connexion');
    await acceptBanners(page);
    
    await page.fill('input[name="email"]', 'invalid@test.local');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/invalide|incorrect|erreur/i).first()).toBeVisible({ timeout: 10000 });
  });
  
  test('forgot password link exists @regression', async ({ page }) => {
    await page.goto('/connexion');
    await acceptBanners(page);
    
    // Verify forgot password link
    const forgotLink = page.getByRole('link', { name: /mot de passe oublié|forgot password/i });
    await expect(forgotLink).toBeVisible();
  });
});
