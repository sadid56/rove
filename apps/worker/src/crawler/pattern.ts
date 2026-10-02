/**
 * Determines whether a URL segment is dynamic (ID, UUID, slug, entity name, or filter).
 * Works purely through structural analysis without hardcoded route prefixes.
 */
function isDynamicSegment(seg?: string): boolean {
  if (!seg) return false;
  // Numeric ID (e.g. 123, 45678)
  if (/^\d+$/.test(seg)) return true;
  // UUID (e.g. 2078d677-aa75-4fee-823d-be8ccaf9f7fe)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) return true;
  // Dynamic slug with hyphens, underscores, digits, or long hash
  if (seg.includes("-") || seg.includes("_") || /\d/.test(seg) || seg.length > 20) return true;
  // Capitalized entity / category name (e.g. Icons, Figma, React, Flutter, Toyota)
  if (/^[A-Z][a-zA-Z0-9]+$/.test(seg)) return true;
  // Common collection filter and view modifiers
  if (["all", "index", "feed", "recent", "popular", "top", "latest", "featured"].includes(seg.toLowerCase())) {
    return true;
  }
  return false;
}

/**
 * Universal Route Pattern Recognition.
 * Fully algorithmic without ANY hardcoded domain or route prefixes.
 * Dynamically clusters:
 * 1. Root static pages: /pricing, /about, /login, /dashboard
 * 2. Static multi-level settings: /settings/billing, /settings/security
 * 3. Dynamic leaf detail templates: /any-section/any-slug, /any-section/cat/any-slug -> /any-section/:detail
 * 4. Filter / category lists: /any-section/all, /any-section/Icons -> /any-section/:filter
 */
export function getRoutePattern(pathname: string): string {
  const cleanPath = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  const segments = cleanPath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  const root = segments[0]?.toLowerCase();
  if (!root) return "/";
  if (segments.length === 1) return `/${root}`;

  const leaf = segments[segments.length - 1];
  if (!leaf) return `/${root}`;

  // If path depth is >= 3 (e.g. /blog/Icons/best-flutter-..., /store/men/shoes/nike-air-max):
  // In modern web frameworks, multi-level routes with dynamic leaves share the same page template
  if (segments.length >= 3) {
    if (isDynamicSegment(leaf)) {
      return `/${root}/:detail`;
    }
    return `/${root}/:category/${leaf.toLowerCase()}`;
  }

  // Depth is exactly 2: e.g. /section/item
  if (isDynamicSegment(leaf)) {
    // If it's a slug with hyphens, numbers, or UUID, it's a detail page template
    if (leaf.includes("-") || leaf.includes("_") || /\d/.test(leaf) || leaf.length > 20) {
      return `/${root}/:detail`;
    }
    // Otherwise it's a category/filter (e.g. /blog/all, /blog/Icons, /blog/Figma)
    return `/${root}/:filter`;
  }

  // Regular distinct static sub-pages (e.g. /settings/billing, /auth/login)
  return `/${root}/${leaf.toLowerCase()}`;
}

/**
 * Checks whether a candidate route should be sampled based on how many times its pattern
 * has already been included.
 */
export function shouldSampleRoute(
  pathname: string,
  patternCounts: Map<string, number>,
  maxSamplesPerPattern = 1
): boolean {
  const pattern = getRoutePattern(pathname);
  const count = patternCounts.get(pattern) || 0;
  return count < maxSamplesPerPattern;
}

/**
 * Increments the sample count for a given route pattern.
 */
export function recordRouteSample(
  pathname: string,
  patternCounts: Map<string, number>
): void {
  const pattern = getRoutePattern(pathname);
  const count = patternCounts.get(pattern) || 0;
  patternCounts.set(pattern, count + 1);
}

/**
 * Filters an array of candidate URLs, keeping at most `maxSamplesPerPattern`
 * URL for each dynamic route template.
 */
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
      // If parsing fails, preserve
      filtered.push(urlStr);
    }
  }

  return filtered;
}
