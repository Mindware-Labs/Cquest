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
  // No `experimental.viewTransition`. Route transitions are handled entirely
  // by RouteTransition's curtain; enabling the flag again lets a stray
  // <ViewTransition> paint route snapshots in the top layer, above the
  // curtain, which reintroduces the outgoing-page flash. See styles/base.css.
};

export default nextConfig;
