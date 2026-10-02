import { normalizeUrl, isValidPageRoute } from "./normalizer";

export async function discoverSitemapRoutes(targetUrl: string): Promise<string[]> {
  const routes = new Set<string>();
  const origin = new URL(targetUrl).origin;

  const candidateUrls = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/robots.txt`
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Rove-QA-Bot/1.0" },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) continue;

      const text = await res.text();

      if (url.endsWith("robots.txt")) {
        const sitemapMatches = text.matchAll(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
        for (const match of sitemapMatches) {
          if (match[1]) {
            const nestedRoutes = await fetchXmlSitemap(match[1]);
            nestedRoutes.forEach((r) => {
              if (isValidPageRoute(r)) routes.add(r);
            });
          }
        }
      } else {
        const extracted = parseLocTags(text);
        extracted.forEach((r) => {
          const norm = normalizeUrl(r, origin);
          if (norm && isValidPageRoute(norm)) routes.add(norm);
        });
      }
    } catch {
      // Continue to next candidate
    }
  }

  return Array.from(routes);
}

async function fetchXmlSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "Rove-QA-Bot/1.0" },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseLocTags(xml);
  } catch {
    return [];
  }
}

function parseLocTags(xml: string): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match: RegExpExecArray | null;

  while ((match = locRegex.exec(xml)) !== null) {
    if (match[1]) {
      urls.push(match[1].trim());
    }
  }

  return urls;
}
