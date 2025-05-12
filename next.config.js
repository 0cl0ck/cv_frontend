const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['*'] : [],
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  serverExternalPackages: ['pino', 'thread-stream'],
  logging: {
    incomingRequests: {
      ignore: [/\/api\/auth\/me/],
    },
  },
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
  redirects: async () => [
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
  ],
  rewrites: async () => {
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://api.chanvre-vert.fr';
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
