function isDynamicSegment(seg?: string): boolean {
  if (!seg) return false;
  if (/^\d+$/.test(seg)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) return true;
  if (seg.includes("-") || seg.includes("_") || /\d/.test(seg) || seg.length > 20) return true;
  if (/^[A-Z][a-zA-Z0-9]+$/.test(seg)) return true;
  if (["all", "index", "feed", "recent", "popular", "top", "latest", "featured"].includes(seg.toLowerCase())) {
    return true;
  }
  return false;
}

export function getRoutePattern(pathname: string): string {
  const cleanPath = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  const segments = cleanPath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  const root = segments[0]?.toLowerCase();
  if (!root) return "/";
  if (segments.length === 1) return `/${root}`;

  const leaf = segments[segments.length - 1];
  if (!leaf) return `/${root}`;

  if (segments.length >= 3) {
    if (isDynamicSegment(leaf)) {
      return `/${root}/:detail`;
    }
    return `/${root}/:category/${leaf.toLowerCase()}`;
  }

  if (isDynamicSegment(leaf)) {
    if (leaf.includes("-") || leaf.includes("_") || /\d/.test(leaf) || leaf.length > 20) {
      return `/${root}/:detail`;
    }
    return `/${root}/:filter`;
  }

  return `/${root}/${leaf.toLowerCase()}`;
}

export function shouldSampleRoute(
  pathname: string,
  patternCounts: Map<string, number>,
  maxSamplesPerPattern = 1
): boolean {
  const pattern = getRoutePattern(pathname);
  const count = patternCounts.get(pattern) || 0;
  return count < maxSamplesPerPattern;
}

export function recordRouteSample(
  pathname: string,
  patternCounts: Map<string, number>
): void {
  const pattern = getRoutePattern(pathname);
  const count = patternCounts.get(pattern) || 0;
  patternCounts.set(pattern, count + 1);
}

export function filterUniquePatternRoutes(
  urls: string[],
  maxSamplesPerPattern = 1
): string[] {
  const patternCounts = new Map<string, number>();
  const filtered: string[] = [];

  for (const urlStr of urls) {
    try {
      const urlObj = new URL(urlStr);
      const pathname = urlObj.pathname;

      if (shouldSampleRoute(pathname, patternCounts, maxSamplesPerPattern)) {
        filtered.push(urlStr);
        recordRouteSample(pathname, patternCounts);
      }
    } catch {
      filtered.push(urlStr);
    }
  }

  return filtered;
}
