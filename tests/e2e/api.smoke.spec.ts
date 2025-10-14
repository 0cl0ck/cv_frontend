import { test, expect } from '@playwright/test';

const getBaseOrigin = (baseURL: string | undefined): string => {
  try {
    return new URL(baseURL ?? 'http://localhost:3001').origin;
  } catch {
    return 'http://localhost:3001';
  }
};

const withOrigin = (origin: string): Record<string, string> => ({
  Origin: origin,
  'Content-Type': 'application/json',
});

const isRecord = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null;
const isNumber = (val: unknown): val is number => typeof val === 'number' && Number.isFinite(val);

const expectJsonContentType = (headers: Record<string, string>): void => {
  const ct = headers['content-type'] || headers['Content-Type'] || '';
  expect(ct.includes('application/json')).toBeTruthy();
};

const expectPricingShape = (body: unknown): void => {
  expect(isRecord(body)).toBeTruthy();
  const r = body as Record<string, unknown>;
  expect(typeof r.success).toBe('boolean');
  expect(isNumber(r.subtotal)).toBeTruthy();
  expect(isNumber(r.subtotalCents)).toBeTruthy();
  expect(isNumber(r.shippingCost)).toBeTruthy();
  expect(isNumber(r.shippingCostCents)).toBeTruthy();
  expect(isNumber(r.loyaltyDiscount)).toBeTruthy();
  expect(isNumber(r.loyaltyDiscountCents)).toBeTruthy();
  expect(isNumber(r.promoDiscount)).toBeTruthy();
  expect(isNumber(r.promoDiscountCents)).toBeTruthy();
  expect(isNumber(r.referralDiscount)).toBeTruthy();
  expect(isNumber(r.referralDiscountCents)).toBeTruthy();
  expect(isNumber(r.total)).toBeTruthy();
  expect(isNumber(r.totalCents)).toBeTruthy();
  expect(r.currency).toBe('EUR');
};

// Public BFF routes
test.describe('Public BFF routes', () => {
  test('GET /api/products -> 200 JSON', async ({ request }) => {
    const res = await request.get('/api/products?limit=1');
    expect(res.ok()).toBeTruthy();
    expectJsonContentType(await res.headers());
  });

  test('GET /api/categories -> 200 JSON', async ({ request }) => {
    const res = await request.get('/api/categories');
    expect(res.ok()).toBeTruthy();
    expectJsonContentType(await res.headers());
  });

  test('GET /api/search/products -> 200 JSON', async ({ request }) => {
    const res = await request.get('/api/search/products?q=test&limit=1');
    expect(res.ok()).toBeTruthy();
    expectJsonContentType(await res.headers());
  });

  test('GET /api/reviews without productId -> 400', async ({ request }) => {
    const res = await request.get('/api/reviews');
    expect(res.status()).toBe(400);
  });
});

// Pricing routes (BFF local compute)
test.describe('Pricing BFF', () => {
  test('POST /api/pricing -> 200 with totals', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/pricing', {
      headers: withOrigin(origin),
      data: {
        items: [
          { price: 15.9, quantity: 2 },
          { price: 4.5, quantity: 1 },
        ],
        country: 'FR',
        loyaltyDiscount: 0,
        promoDiscount: 0,
        referralDiscount: 0,
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as unknown;
    expectPricingShape(body);
  });

  test('POST /api/cart/pricing alias -> 200 with totals', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/cart/pricing', {
      headers: withOrigin(origin),
      data: {
        items: [
          { price: 10, quantity: 1 },
        ],
        country: 'FR',
        loyaltyDiscount: 0,
        promoDiscount: 0,
        referralDiscount: 0,
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as unknown;
    expectPricingShape(body);
  });
});

// CSRF endpoint
test.describe('CSRF', () => {
  test('GET /api/csrf -> 200 sets cookies', async ({ request }) => {
    const res = await request.get('/api/csrf');
    expect(res.ok()).toBeTruthy();
    const setCookie = res.headers()['set-cookie'] || '';
    expect(setCookie.includes('csrf-token=')).toBeTruthy();
    expect(setCookie.includes('csrf-sign=')).toBeTruthy();
  });
});

// Protected routes (without auth -> expect 401)
// For mutative routes, include Origin to pass CSRF origin-check and reach auth logic
test.describe('Protected BFF routes (no auth)', () => {
  test('GET /api/auth/me -> 401', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
  });

  test('GET /api/customers/addresses -> 401', async ({ request }) => {
    const res = await request.get('/api/customers/addresses');
    expect(res.status()).toBe(401);
  });

  test('POST /api/checkout -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/checkout', {
      headers: withOrigin(origin),
      data: { items: [] },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/cart/apply-referral -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/cart/apply-referral', {
      headers: withOrigin(origin),
      data: { code: 'TEST' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/cart/apply-loyalty -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/cart/apply-loyalty', {
      headers: withOrigin(origin),
      data: { points: 100 },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/loyalty/status -> 401', async ({ request }) => {
    const res = await request.get('/api/loyalty/status');
    expect(res.status()).toBe(401);
  });

  test('POST /api/loyalty/claim -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/loyalty/claim', {
      headers: withOrigin(origin),
      data: { reward: 'TEST' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/loyalty/sync -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/loyalty/sync', {
      headers: withOrigin(origin),
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/loyalty/cart -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/loyalty/cart', {
      headers: withOrigin(origin),
      data: { items: [] },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/payment/verify/:code -> 401', async ({ request }) => {
    const res = await request.get('/api/payment/verify/TESTCODE');
    expect(res.status()).toBe(401);
  });

  test('POST /api/payment/create -> 401', async ({ request, baseURL }) => {
    const origin = getBaseOrigin(baseURL);
    const res = await request.post('/api/payment/create', {
      headers: withOrigin(origin),
      data: { amount: 100 },
    });
    expect(res.status()).toBe(401);
  });
});
