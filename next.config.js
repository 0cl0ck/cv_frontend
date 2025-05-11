// Temporairement désactivé pour résoudre les problèmes de build
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true, // Complètement désactivé temporairement
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  // Réactivé après avoir résolu le problème d'ajout au panier
  reactStrictMode: true,
  // Configure les origines de développement autorisées (pour ngrok)
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['*'] : [],
  // Forcer la détection des nouvelles pages
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Externaliser les modules problématiques pour la journalisation
  serverExternalPackages: ['pino', 'thread-stream'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.chanvre-vert.fr',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/success',
        destination: '/paiement-reussi',
        permanent: true,
      },
      {
        source: '/failure',
        destination: '/paiement-echoue',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // En développement, utiliser le backend local (port 3000)
    // En production, utiliser le backend déployé
    return process.env.NODE_ENV === 'development'
      ? [
          // Exclure les routes d'authentification gérées par le frontend
          {
            source: '/api/auth/me',
            destination: '/api/auth/me',
          },
          {
            source: '/api/auth/login',
            destination: '/api/auth/login',
          },
          {
            source: '/api/auth/logout',
            destination: '/api/auth/logout',
          },
          {
            source: '/api/auth/verify/:path*', 
            destination: '/api/auth/verify/:path*',
          },
          // Toutes les autres routes API sont redirigées vers le backend
          {
            source: '/api/:path*',
            destination: 'http://localhost:3000/api/:path*',
          }
        ]
      : [
          // Exclure les routes d'authentification gérées par le frontend
          {
            source: '/api/auth/me',
            destination: '/api/auth/me',
          },
          {
            source: '/api/auth/login',
            destination: '/api/auth/login',
          },
          {
            source: '/api/auth/logout',
            destination: '/api/auth/logout',
          },
          {
            source: '/api/auth/verify/:path*', 
            destination: '/api/auth/verify/:path*',
          },
          // Toutes les autres routes API sont redirigées vers le backend
          {
            source: '/api/:path*',
            destination: 'https://cv-backend-ezur.onrender.com/api/:path*',
          }
        ];
  },
};

module.exports = withPWA(nextConfig);
