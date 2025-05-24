import { httpClient } from '../httpClient';

/**
 * Basic integration test of csrf + login using MSW server.
 */
describe('authentication flow', () => {
  it('initializes csrf, logs in, then accesses a protected route', async () => {
    const csrfResp = await httpClient.get('/csrf');
    expect(csrfResp.status).toBe(200);

    const loginResp = await httpClient.post('/auth/login', {
      email: 'john@example.com',
      password: 'secret',
    }, {
      headers: { 'X-CSRF-Token': 'test-csrf' },
    });
    expect(loginResp.status).toBe(200);

    const protectedResp = await httpClient.post('/protected', {}, {
      headers: { 'X-CSRF-Token': 'test-csrf' },
    });
    expect(protectedResp.status).toBe(200);
    expect(protectedResp.data).toEqual({ ok: true });
  });
});
