
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // output: 'export', // Removed for server-side features
  images: {
    unoptimized: true // Necessary for static export if not using a custom loader or Vercel/Netlify
  },
  webpack: (config, { isServer }) => {
    // For static export (client-side build), we don't want to bundle 'async_hooks'.
    // This prevents errors from packages like OpenTelemetry that use it.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Spread existing fallbacks
        async_hooks: false, // Provide an empty module for async_hooks on the client
      };
    }

    // Important: return the modified config
    return config;
  },
};
module.exports = nextConfig;
export default nextConfig;
