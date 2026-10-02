const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "_ga",
  "ref"
]);

const ASSET_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".less",
  ".json",
  ".map",
  ".xml",
  ".txt",
  ".csv",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".mp4",
  ".webm",
  ".ogv",
  ".mp3",
  ".wav",
  ".ogg"
]);

export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const parsed = baseUrl ? new URL(rawUrl, baseUrl) : new URL(rawUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    parsed.hash = "";

    const params = Array.from(parsed.searchParams.entries());
    parsed.search = "";
    for (const [key, value] of params) {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.append(key, value);
      }
    }

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validates whether a URL is a legitimate web application HTML page route.
 * Excludes Next.js internal chunks (/_next/*), asset files (.js, .css, .xml), and API endpoints.
 */
export function isValidPageRoute(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const pathname = parsed.pathname.toLowerCase();

    // Ignore Next.js internals, framework chunks, static assets, and APIs
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/_nuxt") ||
      pathname.startsWith("/_astro") ||
      pathname.startsWith("/__vite") ||
      pathname.startsWith("/api/") ||
      pathname === "/api"
    ) {
      return false;
    }

    for (const ext of ASSET_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function isSameOrigin(urlA: string, urlB: string): boolean {
  try {
    return new URL(urlA).origin === new URL(urlB).origin;
  } catch {
    return false;
  }
}

export function getPathname(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return parsed.pathname + (parsed.search || "");
  } catch {
    return urlString;
  }
}
