import type { NextConfig } from "next";
import { API_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_CDN_URL, NEXT_PUBLIC_R2_PUBLIC_URL } from "@repo/config";

const nextConfig: NextConfig = {
  env: {
    API_URL,
    NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_R2_PUBLIC_URL,
  },

  async rewrites() {
    return [
      {
        source: "/v1/orpc/:path*",
        destination: `${API_URL}/v1/orpc/:path*`,
      },
      {
        source: "/v1/orpc",
        destination: `${API_URL}/v1/orpc`,
      },
      {
        source: "/rpc/:path*",
        destination: `${API_URL}/rpc/:path*`,
      },
      {
        source: "/rpc",
        destination: `${API_URL}/rpc`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
  devIndicators: false,
};

export default nextConfig;
