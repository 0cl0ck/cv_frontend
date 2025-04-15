import withPWAInit from 'next-pwa';

/** @type {import('next-pwa').PWAConfig} */
const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Désactiver en dev, activer en prod
  register: true,
  skipWaiting: true,
  // Ajoutez d'autres options PWA si nécessaire
};

const withPWA = withPWAInit(pwaConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajoutez ici vos autres configurations Next.js si vous en avez
  reactStrictMode: true,
};

export default withPWA(nextConfig);
