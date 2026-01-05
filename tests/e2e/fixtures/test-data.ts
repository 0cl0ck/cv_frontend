/**
 * E2E Test Fixtures - Test Data Management
 * 
 * Provides reusable fixtures for creating and cleaning up test data
 */

import { APIRequestContext } from '@playwright/test';

// Backend URL resolved at runtime from Playwright config
export function getBackendUrl(request: APIRequestContext): string {
  // The backend URL is passed via extraHTTPHeaders in playwright.config.ts
  // Fallback to staging backend
  return 'https://cv-backend-1-5nru.onrender.com';
}

// Unique identifier for test data isolation
export function uniqueTestId(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// ============================================
// E2E TEST CONSTANTS (must match seed script)
// ============================================

/**
 * Seeded E2E test customer - created by seed-e2e-data.mjs
 * Has 20€ wallet balance and referral code
 */
export const E2E_TEST_CUSTOMER = {
  email: 'e2e-test@chanvre-vert.local',
  password: 'E2eTest2026!',
};

/**
 * Promo codes created by seed script
 */
export const E2E_PROMO_CODES = {
  valid: 'PROMO10E2E',      // 10% discount, active
  expired: 'PROMOEXPIRED',   // Expired end date
  invalid: 'INVALIDCODE123', // Does not exist
};

/**
 * Referral code of E2E test customer
 */
export const E2E_REFERRAL_CODE = 'E2ETEST2026';

// Guest test data with unique email
export function createGuestData(uniqueId: string = uniqueTestId()) {
  return {
    firstName: 'E2E',
    lastName: 'TestUser',
    email: `${uniqueId}@e2e-test.local`,
    phone: '0612345678',
    address: '123 Rue du Test E2E',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
  };
}

// Test customer data for registration
export function createCustomerData(uniqueId: string = uniqueTestId()) {
  const guest = createGuestData(uniqueId);
  return {
    ...guest,
    password: 'TestPassword123!',
    gdprConsent: {
      termsAccepted: true,
      privacyAccepted: true,
      marketingConsent: false,
    },
  };
}

// VivaWallet test cards
export const VIVA_TEST_CARDS = {
  success: {
    number: '4147 4630 1111 0133',
    cvv: '111',
    expiry: '05/28',
  },
  failure: {
    number: '4147 4630 1111 0141',
    cvv: '111',
    expiry: '05/28',
  },
  threeDSecure: {
    number: '4147 4630 1111 0117',
    cvv: '111',
    expiry: '05/28',
  },
};

// Webhook payload templates
export const WEBHOOK_PAYLOADS = {
  transactionSuccess: (orderCode: string, amountCents: number) => ({
    EventTypeId: 1796, // Transaction Payment Created
    TransactionId: `txn-${uniqueTestId()}`,
    EventData: {
      OrderCode: orderCode,
      Amount: amountCents,
      CurrencyCode: 'EUR',
      StatusId: 'F', // Final/Success
    },
  }),
  transactionFailure: (orderCode: string, amountCents: number) => ({
    EventTypeId: 1797, // Transaction Failed
    TransactionId: `txn-${uniqueTestId()}`,
    EventData: {
      OrderCode: orderCode,
      Amount: amountCents,
      CurrencyCode: 'EUR',
      StatusId: 'E', // Error
      ReasonCode: 'CARD_DECLINED',
    },
  }),
};

/**
 * API helper to create a test customer directly in backend
 */
export async function createTestCustomer(
  request: APIRequestContext,
  data?: Partial<ReturnType<typeof createCustomerData>>
) {
  const customerData = { ...createCustomerData(), ...data };
  const backendUrl = getBackendUrl(request);
  
  const response = await request.post(`${backendUrl}/api/customers`, {
    data: customerData,
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok()) {
    throw new Error(`Failed to create test customer: ${response.status()}`);
  }
  
  return {
    ...await response.json(),
    password: customerData.password, // Keep password for login tests
  };
}

/**
 * API helper to delete test customer (cleanup)
 */
export async function deleteTestCustomer(
  request: APIRequestContext,
  customerId: string,
  adminToken: string
) {
  const backendUrl = getBackendUrl(request);
  
  await request.delete(`${backendUrl}/api/customers/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * API helper to get order by vivaOrderCode
 */
export async function getOrderByVivaCode(
  request: APIRequestContext,
  vivaOrderCode: string,
  token?: string
) {
  const backendUrl = getBackendUrl(request);
  
  const response = await request.get(`${backendUrl}/api/orders`, {
    params: {
      where: JSON.stringify({ vivaOrderCode: { equals: vivaOrderCode } }),
      limit: 1,
    },
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  
  if (!response.ok()) {
    return null;
  }
  
  const data = await response.json();
  return data.docs?.[0] || null;
}

/**
 * API helper to get customer by email
 */
export async function getCustomerByEmail(
  request: APIRequestContext,
  email: string,
  adminToken: string
) {
  const backendUrl = getBackendUrl(request);
  
  const response = await request.get(`${backendUrl}/api/customers`, {
    params: {
      where: JSON.stringify({ email: { equals: email } }),
      limit: 1,
    },
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  
  if (!response.ok()) {
    return null;
  }
  
  const data = await response.json();
  return data.docs?.[0] || null;
}
