const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
})

// This file is used specifically for bundle analysis builds
// Copy of the main next.config.js with bundle analyzer wrapper
module.exports = withBundleAnalyzer({
  // Include your existing Next.js config options here
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
  },
  // Enable SWC minification
  swcMinify: true,
})
