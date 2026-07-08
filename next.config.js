const nextConfig = {
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'three'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// PWA wrapper
const withPWA = require('@ducanh2912/next-pwa').default;

const pwaConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        },
      },
      {
        urlPattern: /\/api\/trpc\/post\.heatmap.*/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'trpc-heatmap-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 2 },
        },
      },
    ],
  },
})(nextConfig);

module.exports = pwaConfig;
