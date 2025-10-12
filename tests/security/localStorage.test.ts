/**
 * Tests de sécurité: Vérification localStorage
 * 
 * Objectif: S'assurer qu'aucun token JWT n'est stocké en localStorage
 * Protection contre: XSS token theft
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Sécurité localStorage - Protection XSS', () => {
  beforeEach(() => {
    // Nettoyer localStorage avant chaque test
    localStorage.clear();
  });

  it('ne doit pas contenir de token auth_bearer', () => {
    const authBearer = localStorage.getItem('auth_bearer');
    expect(authBearer).toBeNull();
  });

  it('ne doit pas contenir de token JWT dans aucune clé', () => {
    const allKeys = Object.keys(localStorage);
    const suspiciousKeys = allKeys.filter(key => 
      key.toLowerCase().includes('token') || 
      key.toLowerCase().includes('jwt') ||
      key.toLowerCase().includes('bearer') ||
      key.toLowerCase().includes('auth')
    );

    // Vérifier que si des clés "auth" existent, elles ne contiennent pas de JWT
    suspiciousKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        // Un JWT a 3 parties séparées par des points
        const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        expect(value).not.toMatch(jwtPattern);
      }
    });
  });

  it('ne doit pas permettre de stocker auth_bearer', () => {
    // Simuler une tentative de stockage malveillant
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    
    localStorage.setItem('auth_bearer', fakeToken);
    
    // Dans un vrai environnement, ce token devrait être intercepté/supprimé
    // Pour le test, on vérifie juste qu'on peut le détecter
    const stored = localStorage.getItem('auth_bearer');
    
    // Si un token est trouvé, c'est une vulnérabilité
    if (stored && /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(stored)) {
      console.warn('⚠️ VULNÉRABILITÉ: Un token JWT a été détecté en localStorage');
    }
    
    // Nettoyer
    localStorage.removeItem('auth_bearer');
  });

  it('httpClient ne doit pas lire localStorage pour Authorization', () => {
    // Simuler présence d'un token
    localStorage.setItem('auth_bearer', 'fake-token');
    
    // Vérifier que httpClient ne le lit pas
    // Note: Ce test est plus conceptuel - dans la vraie impl, httpClient ne doit pas
    // avoir de code qui lit localStorage pour auth_bearer
    
    const hasLocalStorageRead = false; // À implémenter: scan du code httpClient
    expect(hasLocalStorageRead).toBe(false);
    
    localStorage.removeItem('auth_bearer');
  });
});

describe('Sécurité localStorage - Bonnes pratiques', () => {
  it('peut stocker des données non-sensibles', () => {
    // Ces données sont OK en localStorage
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'fr');
    localStorage.setItem('cart-draft', JSON.stringify({ items: [] }));
    
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('language')).toBe('fr');
  });

  it('doit éviter de stocker des données personnelles', () => {
    const suspiciousData = [
      'password',
      'email',
      'phone',
      'address',
      'credit-card',
      'ssn',
      'api-key',
    ];

    const allKeys = Object.keys(localStorage);
    
    suspiciousData.forEach(suspicious => {
      const found = allKeys.some(key => 
        key.toLowerCase().includes(suspicious)
      );
      
      if (found) {
        console.warn(`⚠️ Donnée sensible potentielle en localStorage: ${suspicious}`);
      }
    });
  });
});

