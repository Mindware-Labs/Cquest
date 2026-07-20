import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 82],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
