import { httpClient } from '../httpClient';

// Helper adapter to avoid real network requests
const mockAdapter = jest.fn(config => Promise.resolve({
  data: null,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
}));

function clearCookies() {
  document.cookie.split(';').forEach(c => {
    const eqPos = c.indexOf('=');
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}

beforeEach(() => {
  clearCookies();
  mockAdapter.mockClear();
});

describe('httpClient CSRF interceptor', () => {
  it('adds X-CSRF-Token header when cookie is present on mutating requests', async () => {
    document.cookie = 'csrf-token=test-token';
    await httpClient.post('/test', {}, { adapter: mockAdapter });
    expect(mockAdapter).toHaveBeenCalled();
    const config = mockAdapter.mock.calls[0][0];
    expect(config.headers['X-CSRF-Token']).toBe('test-token');
    expect(config.withCredentials).toBe(true);
  });

  it('does not add header if cookie is missing', async () => {
    await httpClient.post('/test', {}, { adapter: mockAdapter });
    const config = mockAdapter.mock.calls[0][0];
    expect(config.headers['X-CSRF-Token']).toBeUndefined();
  });
});
