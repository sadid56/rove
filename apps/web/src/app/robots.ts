import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/rpc/", "/v1/orpc/"],
      },
      {
        // Explicitly allow leading AI search engines
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended", "Bingbot"],
        allow: ["/", "/#features", "/#workflow"],
        disallow: ["/api/", "/rpc/", "/v1/orpc/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
