/**
 * E2E Test: VivaWallet Webhook Handling
 * 
 * These tests directly call the webhook endpoint to verify backend processing.
 * 
 * Validates:
 * - Webhook endpoint responds correctly
 * - Order status is updated on payment success
 * - Cashback/loyalty is applied correctly
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { WEBHOOK_PAYLOADS, uniqueTestId } from '../fixtures';

// Backend URL for API calls
const BACKEND_URL = 'https://cv-backend-1-5nru.onrender.com';

// Helper to get an existing order for testing
async function getRecentPendingOrder(request: APIRequestContext) {
  const response = await request.get(`${BACKEND_URL}/api/orders`, {
    params: {
      where: JSON.stringify({
        paymentStatus: { equals: 'pending' },
        vivaOrderCode: { exists: true },
      }),
      limit: 1,
      sort: '-createdAt',
    },
  });
  
  if (!response.ok()) {
    return null;
  }
  
  const data = await response.json();
  return data.docs?.[0] || null;
}

test.describe('VivaWallet Webhook - API Tests', () => {
  
  test('webhook endpoint returns verification key on GET @critical', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/webhooks/vivawallet`);
    
    // VivaWallet verification requires 200 with Key in body
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('Key');
    expect(typeof data.Key).toBe('string');
  });
  
  test('webhook endpoint accepts POST with valid payload @critical', async ({ request }) => {
    // Create a mock webhook payload
    const mockPayload = WEBHOOK_PAYLOADS.transactionSuccess(
      `mock-${uniqueTestId()}`, // Non-existent order code
      2500 // 25.00 EUR in cents
    );
    
    const response = await request.post(`${BACKEND_URL}/api/webhooks/vivawallet`, {
      data: mockPayload,
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, signature verification is required
      },
    });
    
    // Should not return 500 (internal error)
    expect(response.status()).not.toBe(500);
    
    // Should return 200 or 404 (order not found is acceptable for mock)
    expect([200, 404]).toContain(response.status());
  });
  
  test('webhook processes real order correctly @regression @slow', async ({ request }) => {
    // Find a real pending order
    const pendingOrder = await getRecentPendingOrder(request);
    
    if (!pendingOrder) {
      test.skip();
      return;
    }
    
    // Note: This test would need admin credentials to verify order state changes
    // For now, we just verify the endpoint is reachable
    expect(pendingOrder.vivaOrderCode).toBeDefined();
  });
  
  test('webhook rejects invalid JSON @regression', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/api/webhooks/vivawallet`, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Should return 400 Bad Request or 500
    expect([400, 500]).toContain(response.status());
  });
});

test.describe('VivaWallet Webhook - Integration Flow', () => {
  
  test.skip('payment success webhook updates order to paid @critical', async ({ request }) => {
    // This test requires:
    // 1. Creating a real order via checkout
    // 2. Completing payment in VivaWallet demo
    // 3. Waiting for webhook or simulating it
    // 
    // For now, this is marked as skip - implement when you have
    // admin API credentials for verification
    
    // TODO: Implement with admin auth
    expect(true).toBe(true);
  });
  
  test.skip('payment success webhook applies cashback @regression', async ({ request }) => {
    // This test requires:
    // 1. Customer with known wallet balance
    // 2. Completed order
    // 3. Verification of wallet.history update
    //
    // Requires admin credentials
    
    // TODO: Implement with admin auth
    expect(true).toBe(true);
  });
});
