import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config updated for Vercel deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p.qrsim.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.qrsim.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.e-sim.vip',
        pathname: '/**',
      },
    ],
  },
  // Ensure trailing slashes are handled consistently (optional, but good for SEO/consistency)
  trailingSlash: false,
};

export default nextConfig;
