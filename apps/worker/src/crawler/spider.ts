import { normalizeUrl, isSameOrigin, isValidPageRoute } from "./normalizer";

export function extractInternalLinks(html: string, baseUrl: string): string[] {
  const discovered = new Set<string>();

  // Only match hyperlinks from anchor <a> tags, ignoring <link rel="preload">, <script>, or <style>
  const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"'#\s>]+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const rawHref = match[1]?.trim();
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("javascript:") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:")
    ) {
      continue;
    }

    const normalized = normalizeUrl(rawHref, baseUrl);
    if (!normalized) continue;

    if (!isSameOrigin(normalized, baseUrl)) continue;

    // Strict validation: skip Next.js internals (/_next/*), static chunks, JS, CSS, and asset files
    if (!isValidPageRoute(normalized)) continue;

    discovered.add(normalized);
  }

  return Array.from(discovered);
}
