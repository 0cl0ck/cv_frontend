const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  // Réactivé après avoir résolu le problème d'ajout au panier
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
    return [
      {
        source: '/api/:path*',
        destination: 'https://cv-backend-ezur.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
