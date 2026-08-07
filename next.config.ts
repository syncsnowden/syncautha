// Trigger build: Verified Edge Runtime compliance
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers handled by Cloudflare _headers file
  // Image domains (add your CDN if needed)
  images: {
    remotePatterns: [],
  },
  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
