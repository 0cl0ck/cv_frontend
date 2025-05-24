import { validateCsrfToken } from '@/lib/security/csrf';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ data })),
    next: jest.fn(() => ({ next: true })),
    redirect: jest.fn((url) => ({ redirect: url })),
  },
}));

import { middleware } from '../middleware';

jest.mock('@/lib/security/csrf', () => ({
  validateCsrfToken: jest.fn().mockResolvedValue(true),
}));

describe('middleware CSRF logic removed', () => {
  it('does not call validateCsrfToken for POST requests', async () => {
    const request = {
      headers: new Headers(),
      cookies: { get: jest.fn() },
      nextUrl: new URL('http://localhost/api/test'),
      url: 'http://localhost/api/test',
      method: 'POST',
    } as any;

    await middleware(request);

    expect(validateCsrfToken).not.toHaveBeenCalled();
  });
});
