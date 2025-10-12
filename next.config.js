const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable in development to prevent GenerateSW warnings
  disable: process.env.NODE_ENV === 'development',
  // Only build once in production
  buildExcludes: [/middleware-manifest.json$/],
  // Runtime caching strategy - NE JAMAIS cacher les routes sensibles
  runtimeCaching: [
    {
      // Routes d'authentification - NetworkOnly (jamais de cache)
      urlPattern: /^\/api\/auth\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'auth-api',
      },
    },
    {
      // Routes clients/comptes - NetworkOnly (données personnelles)
      urlPattern: /^\/api\/customers\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'customers-api',
      },
    },
    {
      // Routes commandes - NetworkOnly (données sensibles)
      urlPattern: /^\/api\/(checkout|orders|payment)\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'orders-api',
      },
    },
    {
      // Routes fidélité - NetworkOnly (données personnelles)
      urlPattern: /^\/api\/loyalty\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'loyalty-api',
      },
    },
    {
      // Routes panier - NetworkOnly (données personnelles)
      urlPattern: /^\/api\/cart\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'cart-api',
      },
    },
    {
      // Images - CacheFirst pour performance
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      // Fichiers statiques - CacheFirst
      urlPattern: /\.(?:js|css|woff2?)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        },
      },
    },
    {
      // API publiques (produits, catégories) - NetworkFirst avec fallback cache
      urlPattern: /^\/api\/(products|categories)\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'public-api',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    },
  ],
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
  
  // Disable public source maps in production
  productionBrowserSourceMaps: false,
  
  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.chanvre-vert.fr; frame-ancestors 'none';"
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ],
  
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
};

// Apply bundle analyzer wrapper if ANALYZE env var is present
module.exports = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(withPWA(nextConfig))
  : withPWA(nextConfig);
