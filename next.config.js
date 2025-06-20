const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable in development to prevent GenerateSW warnings
  disable: process.env.NODE_ENV === 'development',
  // Only build once in production
  buildExcludes: [/middleware-manifest.json$/],
});

// Configure bundle analyzer for when ANALYZE env var is present
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
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
  
  // Enhanced logging configuration
  logging: {
    incomingRequests: {
      ignore: [/\/api\/auth\/me/],
    },
  },
  
  // Enhanced image optimization
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
  },
  
  // Enhanced experimental features
  experimental: {
    // Optimize imports from heavy packages like icon libraries
    optimizePackageImports: ['@radix-ui/icons', '@tabler/icons-react', 'lucide-react'],
    // Enable modern JavaScript features and CSS optimization
    optimizeCss: true,
    // Reduce client JS bundle size
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable compression
  compress: true,
  
  // Remove X-Powered-By header
  poweredByHeader: false,
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

// Apply bundle analyzer wrapper if ANALYZE env var is present
module.exports = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(withPWA(nextConfig))
  : withPWA(nextConfig);
