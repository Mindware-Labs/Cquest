import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 82],
    formats: ["image/avif", "image/webp"],
    // Hero/brand photography is static and rarely changes — cache the
    // optimized output for a month instead of re-transforming every 4 hours.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
