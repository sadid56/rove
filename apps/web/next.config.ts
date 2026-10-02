import type { NextConfig } from "next";

const API_SERVER_URL = process.env.API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/rpc/:path*",
        destination: `${API_SERVER_URL}/rpc/:path*`
      },
      {
        source: "/rpc",
        destination: `${API_SERVER_URL}/rpc`
      },
      {
        source: "/api/v1/:path*",
        destination: `${API_SERVER_URL}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
