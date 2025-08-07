import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:3000/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
