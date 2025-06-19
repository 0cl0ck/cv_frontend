const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable in development to prevent GenerateSW warnings
  disable: process.env.NODE_ENV === 'development',
  // Only build once in production
  buildExcludes: [/middleware-manifest.json$/],
});

// Define modern browsers target - this reduces unnecessary polyfills
const browserslistConfig = [
  'Chrome >= 70',
  'Firefox >= 78',
  'Safari >= 14',
  'Edge >= 79',
  'iOS >= 14',
  'not IE 11'
];

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['*'] : [],
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  serverExternalPackages: ['pino', 'thread-stream'],
  // SWC minifier is enabled by default in Next.js 15+
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
  experimental: {
    // Optimize imports from heavy packages like icon libraries
    optimizePackageImports: ['@radix-ui/icons', '@tabler/icons-react', 'lucide-react'],
    // Enable modern JavaScript features and CSS optimization
    optimizeCss: true,
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
      // Redirection de toutes les requêtes API vers le backend
      { source: '/api/:path*', destination: `${baseUrl}/api/:path*` },
    ];
  },
};

module.exports = withPWA(nextConfig);
