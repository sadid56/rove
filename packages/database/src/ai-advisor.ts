import type { PageAiAnalysis, ScanAiSummary } from "./schema/scans";
import { GEMINI_API_KEY, GEMINI_MODEL } from "@repo/config";

export interface PageDiagnosisInput {
  routePath: string;
  url: string;
  httpStatus?: number | null;
  healthStatus: "healthy" | "warning" | "failed";
  healthReasons?: string[];
  renderingType?: string | null;
  consoleEvents?: Array<{
    type: string;
    message: string;
    location?: string | null;
    stack?: string | null;
  }>;
  runtimeErrors?: Array<{
    errorType: string;
    message: string;
    source?: string | null;
    line?: number | null;
    stack?: string | null;
  }>;
  networkRequests?: Array<{
    url: string;
    method: string;
    status?: number | null;
    resourceType?: string | null;
    failed?: boolean | null;
    failureReason?: string | null;
  }>;
}

export async function generatePageAiDiagnosis(input: PageDiagnosisInput): Promise<PageAiAnalysis> {
  const { routePath, httpStatus, healthStatus, healthReasons = [], consoleEvents = [], runtimeErrors = [], networkRequests = [] } = input;

  const now = new Date().toISOString();

  // If healthy and no errors, return clean status
  const errorConsole = consoleEvents.filter((c) => c.type === "error");
  const failedRequests = networkRequests.filter((n) => n.failed);

  if (healthStatus === "healthy" && runtimeErrors.length === 0 && errorConsole.length === 0 && failedRequests.length === 0) {
    return {
      status: "clean",
      severity: "clean",
      rootCause: "No issues detected",
      summary: `Route ${routePath} passed all browser QA checks without console errors or failed API requests.`,
      impact: "Clean runtime execution with normal DOM hydration.",
      suggestedFixes: ["No corrective action required."],
      detectedCategories: [],
      analyzedAt: now,
    };
  }

  // Check for Google Gemini API Key
  const geminiApiKey = GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const geminiResult = await callGeminiDiagnosis(input, geminiApiKey);
      if (geminiResult) return geminiResult;
    } catch {
      // Fallback to heuristic advisor if Gemini call fails
    }
  }

  // Heuristic Rule-Based Diagnosis Engine (Fallback)
  return generateHeuristicDiagnosis(input);
}

function generateHeuristicDiagnosis(input: PageDiagnosisInput): PageAiAnalysis {
  const { routePath, httpStatus, healthReasons = [], consoleEvents = [], runtimeErrors = [], networkRequests = [] } = input;

  const now = new Date().toISOString();
  const categories: string[] = [];
  const suggestions: string[] = [];
  let rootCause = "";
  let summary = "";
  let impact = "";
  let codePatch: string | undefined;
  let severity: "critical" | "warning" | "info" = "warning";

  const errorConsole = consoleEvents.filter((c) => c.type === "error");
  const failedRequests = networkRequests.filter((n) => n.failed);
  const hydrationError = runtimeErrors.find(
    (e) =>
      e.errorType === "hydration" ||
      e.message.toLowerCase().includes("hydration") ||
      e.message.toLowerCase().includes("minified react error #418") ||
      e.message.toLowerCase().includes("minified react error #423"),
  );

  // 1. React Hydration Mismatch
  if (hydrationError) {
    severity = "critical";
    categories.push("react_hydration_mismatch");
    rootCause = `React Hydration Mismatch: ${hydrationError.message}`;
    summary = `The server-rendered HTML differed from the initial client render on ${routePath}. This causes React to discard the SSR DOM tree or cause flicker and broken interactivity.`;
    impact = "High: Users may experience layout shifts, unresponsive event listeners, or unmounted components.";
    suggestions.push(
      "Wrap client-dependent browser state (e.g. window, localStorage, Date.now()) inside useEffect or useState with a hasMounted flag.",
      "Check for invalid HTML nesting such as <p> containing <div>, or <tr> outside of <tbody>/<table>.",
      "If rendering timestamps or client locale dates, add suppressHydrationWarning to the specific tag.",
    );
    codePatch = `// Fix: Ensure client-specific state runs after mount
'use client';
import { useEffect, useState } from 'react';

export function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null; // or render a fallback skeleton
  return <>{children}</>;
}`;
  }
  // 2. HTTP 5xx Server Error on Main Route
  else if (httpStatus && httpStatus >= 500) {
    severity = "critical";
    categories.push("server_crash_5xx");
    rootCause = `Server Error HTTP ${httpStatus} encountered on route ${routePath}`;
    summary = `The application server failed to render the requested page, returning status ${httpStatus}.`;
    impact = "Critical: Users cannot access this route and receive a server error page.";
    suggestions.push(
      "Inspect server-side execution logs or error telemetry (e.g. Sentry/Datadog) for this route.",
      "Verify environment variables and database connections are accessible in the production deployment.",
      "Wrap server data loaders in try/catch and return an error boundary fallback.",
    );
    codePatch = `// Example: Guard Server Component data fetching
export default async function Page() {
  try {
    const data = await fetchData();
    return <DataView data={data} />;
  } catch (error) {
    console.error("Failed to load page data:", error);
    return <ErrorFallback error="Unable to load content right now." />;
  }
}`;
  }
  // 3. Failed API Network Requests
  else if (failedRequests.length > 0) {
    const firstFailed = failedRequests[0]!;
    const is500 = firstFailed.status && firstFailed.status >= 500;
    const is401_403 = firstFailed.status === 401 || firstFailed.status === 403;
    const is404 = firstFailed.status === 404;

    severity = is500 ? "critical" : "warning";
    categories.push("failed_network_request");
    rootCause = `Network call failed: [${firstFailed.method}] ${firstFailed.url} (${firstFailed.failureReason || `HTTP ${firstFailed.status}`})`;
    summary = `${failedRequests.length} background API request(s) failed during page load.`;
    impact = is500
      ? "High: Key application data failed to load, leading to empty states or broken features."
      : "Moderate: Missing telemetry, session validation, or supplemental content.";

    if (is401_403) {
      suggestions.push(
        "Check authentication cookie / Bearer token transmission in the request headers.",
        "Ensure CORS credentials (credentials: 'include') are enabled on client fetch.",
      );
    } else if (is404) {
      suggestions.push(
        `Verify endpoint route '${firstFailed.url}' exists on the production backend.`,
        "Check for typo in API base URL or outdated client bundle referring to deleted endpoints.",
      );
    } else {
      suggestions.push(
        `Check backend API handler for ${firstFailed.url} to resolve unhandled 5xx exception.`,
        "Add retry logic with exponential backoff for transient backend network drops.",
      );
    }

    codePatch = `// Example: Resilient API client with error handling
async function safeFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, credentials: 'include' });
    if (!res.ok) {
      throw new Error(\`Request failed with status \${res.status}\`);
    }
    return await res.json();
  } catch (err) {
    console.error(\`Failed to fetch from \${url}:\`, err);
    return null;
  }
}`;
  }
  // 4. Client Runtime Crashes / Uncaught Exceptions
  else if (runtimeErrors.length > 0) {
    const primaryError = runtimeErrors[0]!;
    severity = "critical";
    categories.push("client_runtime_crash");
    rootCause = `Uncaught Runtime Exception: ${primaryError.message}`;
    summary = `A JavaScript exception crashed during execution on ${routePath}.`;
    impact = "High: The page or an entire component tree crashed for end users.";
    suggestions.push(
      "Add optional chaining (?.) and null checks before dereferencing properties from API state.",
      "Wrap dynamic component trees with React Error Boundaries to prevent full-page crashes.",
    );
    codePatch = `// Example: Defensive property access
// Before: const name = data.user.profile.name;
// After:
const name = data?.user?.profile?.name ?? 'Anonymous';`;
  }
  // 5. Console Errors
  else if (errorConsole.length > 0) {
    const primaryMsg = errorConsole[0]!.message;
    categories.push("console_error");
    rootCause = `Console Error: ${primaryMsg}`;
    summary = `${errorConsole.length} error message(s) logged to the browser console on ${routePath}.`;
    impact = "Moderate: May indicate silent failures, unhandled promises, or failed third-party integrations.";
    suggestions.push(
      "Inspect the logged location in developer tools.",
      "Check for unhandled promise rejections or deprecated browser APIs.",
    );
  }
  // 6. Generic Warning
  else {
    categories.push("general_warning");
    rootCause = healthReasons[0] || "Performance or minor health degradation";
    summary = `Issues detected on route ${routePath}: ${healthReasons.join(", ")}`;
    impact = "Minor: Potential slower load time or non-critical resource delay.";
    suggestions.push("Optimize heavy scripts and assets.", "Ensure fast Time To First Byte (TTFB) by utilizing edge caching or ISR.");
  }

  return {
    status: "analyzed",
    severity,
    rootCause,
    summary,
    impact,
    suggestedFixes: suggestions,
    codePatch,
    detectedCategories: categories,
    analyzedAt: now,
  };
}

async function callGeminiDiagnosis(input: PageDiagnosisInput, geminiKey: string): Promise<PageAiAnalysis | null> {
  const promptContext = {
    route: input.routePath,
    status: input.httpStatus,
    healthReasons: input.healthReasons,
    consoleErrors: input.consoleEvents
      ?.filter((c) => c.type === "error")
      .map((c) => ({
        message: c.message,
        location: c.location,
      })),
    runtimeErrors: input.runtimeErrors?.map((r) => ({
      type: r.errorType,
      message: r.message,
      stack: r.stack?.slice(0, 300),
    })),
    failedNetwork: input.networkRequests
      ?.filter((n) => n.failed)
      .map((n) => ({
        url: n.url,
        method: n.method,
        status: n.status,
        reason: n.failureReason,
      })),
  };

  const systemPrompt = `You are an elite autonomous Web QA engineer and diagnostic agent for production web apps.
Analyze the following test failure data collected from headless Chromium browser execution.
Provide a structured JSON output with the exact keys:
- severity: "critical" | "warning" | "info"
- rootCause: string (1-2 sentences identifying root cause)
- summary: string (clear explanation of why this happened)
- impact: string (what happens to end users)
- suggestedFixes: string[] (actionable step-by-step developer advice)
- codePatch: string (clean, copy-pasteable TypeScript/React code solution)
- detectedCategories: string[] (e.g. ["hydration", "network", "runtime"])

Respond ONLY with valid JSON. Do not wrap in markdown quotes if possible, or wrap in \`\`\`json.`;

  const rawModel = (GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
  const modelName = rawModel.startsWith("models/") ? rawModel.replace("models/", "") : rawModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }, { text: `Data:\n${JSON.stringify(promptContext, null, 2)}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        let cleanJson = rawText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleanJson);
        return {
          status: "analyzed",
          severity: parsed.severity || "warning",
          rootCause: parsed.rootCause || "Issue detected",
          summary: parsed.summary || "",
          impact: parsed.impact || "",
          suggestedFixes: parsed.suggestedFixes || [],
          codePatch: parsed.codePatch,
          detectedCategories: parsed.detectedCategories || [],
          analyzedAt: new Date().toISOString(),
        };
      }
    } else {
      const errorText = await res.text();
      console.error(`[Gemini AI] API call returned status ${res.status}:`, errorText);
    }
  } catch (err) {
    console.error("[Gemini AI] Exception while calling Gemini diagnosis:", err);
  }

  return null;
}

export function generateScanAiSummary(params: {
  targetUrl: string;
  totalRoutes: number;
  healthyRoutes: number;
  warningRoutes: number;
  failedRoutes: number;
  failedPages: Array<{
    path: string;
    aiAnalysis?: PageAiAnalysis | null;
    healthReasons?: string[];
  }>;
}): ScanAiSummary {
  const { totalRoutes, healthyRoutes, failedRoutes, failedPages } = params;

  const now = new Date().toISOString();
  const criticalCount = failedRoutes;

  if (failedRoutes === 0 && params.warningRoutes === 0) {
    return {
      overallHealthAssessment: `Excellent: All ${totalRoutes} tested routes are fully operational with zero console or network regressions.`,
      criticalIssuesCount: 0,
      topRiskAreas: [],
      recommendedActions: ["No immediate remediation required. Deployment is green."],
      generatedAt: now,
    };
  }

  const riskAreas: string[] = [];
  const recommendedActions: string[] = [];

  for (const p of failedPages.slice(0, 5)) {
    if (p.aiAnalysis?.rootCause) {
      riskAreas.push(`${p.path}: ${p.aiAnalysis.rootCause}`);
    } else if (p.healthReasons && p.healthReasons.length > 0) {
      riskAreas.push(`${p.path}: ${p.healthReasons[0]}`);
    }
  }

  if (criticalCount > 0) {
    recommendedActions.push(`Prioritize fixing the ${criticalCount} failing route(s) before opening traffic to 100% of users.`);
  }
  recommendedActions.push("Review individual route inspector tabs for copy-pasteable code patches and detailed network traces.");

  return {
    overallHealthAssessment: `Attention Needed: ${healthyRoutes}/${totalRoutes} routes passed cleanly. ${failedRoutes} route(s) encountered critical issues.`,
    criticalIssuesCount: criticalCount,
    topRiskAreas: riskAreas,
    recommendedActions,
    generatedAt: now,
  };
}
