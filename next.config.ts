import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/hari-libur",
        destination: "https://api-hari-libur.vercel.app/api",
      },
    ];
  },
};

export default nextConfig;
