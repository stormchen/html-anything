import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  experimental: {
    turbo: {
      // In Next.js 16/Turbopack, we usually don't need the old webpack aliases
      // but we can add an empty object to satisfy the requirements or opt-out.
    }
  }
};

export default nextConfig;
