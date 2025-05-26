import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export', // Add this line for static export
  images: {
    unoptimized: true // Necessary for static export if not using a custom loader or Vercel/Netlify
  }
};

export default nextConfig;
