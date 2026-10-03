import type { PageTestResult } from "../browser/engine";

export interface PageHealthEvaluation {
  healthStatus: "healthy" | "warning" | "failed";
  healthReasons: string[];
  renderingType: "static" | "isr" | "ssr" | "client-dynamic" | "unknown";
  consoleSummary: { logs: number; warnings: number; errors: number };
  networkSummary: { total: number; failed: number; apiFailed: number; assetsFailed: number };
}

const TRACKER_DOMAINS = [
  "google-analytics.com",
  "analytics.google.com",
  "googletagmanager.com",
  "clarity.ms",
  "c.clarity.ms",
  "scripts.clarity.ms",
  "l.clarity.ms",
  "doubleclick.net",
  "stats.g.doubleclick.net",
  "facebook.net",
  "connect.facebook.net",
  "facebook.com",
  "hotjar.com",
  "sentry.io",
  "browser-intake-datadoghq.com",
  "datadoghq.com",
  "mixpanel.com",
  "posthog.com",
  "segment.io",
  "segment.com",
  "amplitude.com",
  "fullstory.com",
  "bing.com",
  "intercom.io",
  "crisp.chat"
];

export function isTrackerOrTelemetry(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    if (TRACKER_DOMAINS.some((d) => host === d || host.endsWith("." + d))) {
      return true;
    }
    if (parsed.pathname.includes("/collect") && (host.includes("analytics") || host.includes("google"))) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isFirstParty(requestUrl: string, targetUrl?: string): boolean {
  if (!targetUrl) return true;
  try {
    const reqHost = new URL(requestUrl).hostname.replace(/^www\./, "").toLowerCase();
    const targetHost = new URL(targetUrl).hostname.replace(/^www\./, "").toLowerCase();
    if (reqHost === targetHost || reqHost.endsWith("." + targetHost) || targetHost.endsWith("." + reqHost)) {
      return true;
    }
    if (requestUrl.startsWith("/")) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function evaluatePageHealth(result: PageTestResult, targetUrl?: string): PageHealthEvaluation {
  const reasons: string[] = [];

  const consoleErrors = result.consoleEvents.filter((c) => c.type === "error").length;
  const consoleWarnings = result.consoleEvents.filter((c) => c.type === "warn").length;
  const consoleLogs = result.consoleEvents.filter((c) => c.type === "log" || c.type === "info").length;

  const totalNetwork = result.networkRequests.length;
  const failedNetwork = result.networkRequests.filter((r) => r.failed);

  const nonTrackerFailed = failedNetwork.filter((r) => {
    if (isTrackerOrTelemetry(r.url)) return false;
    if (r.resourceType === "ping") return false;
    if (r.failureReason?.includes("ERR_ABORTED") && (r.resourceType === "fetch" || r.resourceType === "xhr")) {
      return false;
    }
    return true;
  });

  const apiFailedRequests = nonTrackerFailed.filter(
    (r) => r.resourceType === "fetch" || r.resourceType === "xhr" || r.url.includes("/api/")
  );

  const firstPartyApiFailed = apiFailedRequests.filter((r) => isFirstParty(r.url, targetUrl)).length;
  const thirdPartyApiFailed = apiFailedRequests.filter((r) => !isFirstParty(r.url, targetUrl)).length;

  const assetsFailed = nonTrackerFailed.filter((r) =>
    ["stylesheet", "script", "image", "font"].includes(r.resourceType)
  ).length;

  if (result.httpStatus && result.httpStatus >= 400) {
    reasons.push(`HTTP status ${result.httpStatus}`);
  }

  if (result.runtimeErrors.length > 0) {
    const hydrations = result.runtimeErrors.filter((e) => e.errorType === "hydration").length;
    if (hydrations > 0) {
      reasons.push(`${hydrations} React hydration error(s)`);
    }
    const uncaught = result.runtimeErrors.length - hydrations;
    if (uncaught > 0) {
      reasons.push(`${uncaught} uncaught runtime exception(s)`);
    }
  }

  if (firstPartyApiFailed > 0) {
    reasons.push(`${firstPartyApiFailed} failed API request(s)`);
  }

  if (thirdPartyApiFailed > 0) {
    reasons.push(`${thirdPartyApiFailed} third-party service issue(s)`);
  }

  if (assetsFailed > 0) {
    reasons.push(`${assetsFailed} broken static asset(s)`);
  }

  if (consoleErrors > 0 && result.runtimeErrors.length === 0) {
    reasons.push(`${consoleErrors} console error(s)`);
  }

  let healthStatus: "healthy" | "warning" | "failed" = "healthy";

  if (
    (result.httpStatus && result.httpStatus >= 400) ||
    result.runtimeErrors.length > 0 ||
    firstPartyApiFailed > 0
  ) {
    healthStatus = "failed";
  } else if (thirdPartyApiFailed > 0 || assetsFailed > 0 || consoleErrors > 0 || consoleWarnings > 2) {
    healthStatus = "warning";
  }

  let renderingType: "static" | "isr" | "ssr" | "client-dynamic" | "unknown" = "unknown";

  const hasFetchRequests = result.networkRequests.some(
    (r) => r.resourceType === "fetch" || r.resourceType === "xhr"
  );

  if (result.html.includes("__NEXT_DATA__") || result.html.includes("self.__next_f")) {
    if (hasFetchRequests) {
      renderingType = "client-dynamic";
    } else {
      renderingType = "static";
    }
  } else if (hasFetchRequests) {
    renderingType = "client-dynamic";
  } else {
    renderingType = "static";
  }

  return {
    healthStatus,
    healthReasons: reasons,
    renderingType,
    consoleSummary: {
      logs: consoleLogs,
      warnings: consoleWarnings,
      errors: consoleErrors
    },
    networkSummary: {
      total: totalNetwork,
      failed: nonTrackerFailed.length,
      apiFailed: apiFailedRequests.length,
      assetsFailed
    }
  };
}
