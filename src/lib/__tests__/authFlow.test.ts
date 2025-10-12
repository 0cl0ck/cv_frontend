import { httpClient } from '../httpClient';

/**
 * Test obsolète - Architecture BFF
 * 
 * NOTE: Ce test était conçu pour l'ancienne architecture où le frontend
 * appelait directement le backend. Avec la nouvelle architecture BFF (Backend-for-Frontend),
 * toutes les routes passent par Next.js /api/*, et ce test nécessiterait un serveur
 * Next.js complet pour fonctionner.
 * 
 * TODO: Migrer vers les tests de sécurité dans tests/security/
 * Les nouveaux tests valident:
 * - tests/security/csrf.test.ts - Protection CSRF
 * - tests/security/bff-auth.test.ts - Architecture BFF et auth
 * - tests/security/localStorage.test.ts - Sécurité tokens
 */
describe.skip('authentication flow (OBSOLÈTE - voir tests/security/)', () => {
  it('initializes csrf, logs in, then accesses a protected route', async () => {
    // Test désactivé - remplacé par tests/security/
    expect(true).toBe(true);
  });
});
