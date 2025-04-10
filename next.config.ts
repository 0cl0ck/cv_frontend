import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   serverActions: true, // si tu utilises les server actions
  // },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
}

export default withPWA(nextConfig)
