import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'waiqr.xyz',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
