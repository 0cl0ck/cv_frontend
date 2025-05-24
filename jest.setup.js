// Global setup and mocks for Jest tests
import '@testing-library/jest-dom';

import { setupServer } from 'msw/node';
import { rest } from 'msw';


// Mocking fetch API
global.fetch = jest.fn();


// Ensure Fetch API classes exist for packages depending on them
if (typeof global.Request === 'undefined') {
  global.Request = class {};
}
if (typeof global.Headers === 'undefined') {
  global.Headers = class { constructor() {} get() {} append() {} };
}
if (typeof global.Response === 'undefined') {
  global.Response = class {};
}


// Simulate environment variables
process.env = {
  ...process.env,
  PAYLOAD_SECRET: 'test-secret-key',
  JWT_ISSUER: 'test-issuer',
  JWT_AUDIENCE: 'test-audience',
};

// Mock Next.js cookies API
const mockCookies = {
  get: jest.fn().mockImplementation((name) => ({ value: `mock-${name}-value` })),
  set: jest.fn(),
  delete: jest.fn(),
};

// Mock Next.js Request object
class MockNextRequest {
  constructor(url = 'http://localhost:3000', options = {}) {
    this.url = url;
    this.nextUrl = new URL(url);
    this.cookies = mockCookies;
    this.headers = new Map();
    this.method = options.method || 'GET';
    this.body = options.body || null;
  }

  json() {
    return Promise.resolve(this.body);
  }
}

global.NextRequest = MockNextRequest;

// Mock Next.js Response object
global.NextResponse = {
  json: jest.fn().mockImplementation((data) => ({
    data,
    cookies: mockCookies,
  })),
};

// Polyfill scrollIntoView for jsdom environment
Element.prototype.scrollIntoView = jest.fn();

// Cleanup after each test
const server = setupServer(
  rest.get('http://localhost:3000/api/csrf', (_req, res, ctx) =>
    res(ctx.status(200), ctx.cookie('csrf-token', 'test-csrf'), ctx.json({ success: true }))
  ),
  rest.post('http://localhost:3000/api/auth/login', (_req, res, ctx) =>
    res(ctx.status(200), ctx.cookie('payload-token', 'test-token'), ctx.json({ loggedIn: true }))
  ),
  rest.post('http://localhost:3000/api/protected', (req, res, ctx) => {
    const csrf = req.headers.get('x-csrf-token');
    if (csrf === 'test-csrf') {
      return res(ctx.status(200), ctx.json({ ok: true }));
    }
    return res(ctx.status(403));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
afterAll(() => server.close());
