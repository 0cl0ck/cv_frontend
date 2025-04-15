/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
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
  // Configuration des redirections pour les pages de paiement
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
  // Autres configurations si nécessaire
};

module.exports = withPWA(nextConfig);
