import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript errors during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
