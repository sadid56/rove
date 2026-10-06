import { db, generatePageAiDiagnosis, generateScanAiSummary, type PageAiAnalysis } from "@repo/database";
import { scans, projects, scanRoutes, pageResults, consoleEvents, runtimeErrors, networkRequests } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { normalizeUrl, getPathname } from "./crawler/normalizer";
import { discoverSitemapRoutes } from "./crawler/sitemap";
import { extractInternalLinks } from "./crawler/spider";
import { BrowserEngine, type PageTestResult } from "./browser/engine";
import { evaluatePageHealth, type PageHealthEvaluation } from "./analyzers/health";
import { detectRegressions } from "./analyzers/regression";
import { logger, DEFAULT_MAX_PAGES } from "@repo/config";
import { addActiveJob, removeActiveJob, isScanCancelled } from "./server";
import { uploadScreenshot, uploadVideo } from "./storage/r2";
import { shouldSampleRoute, recordRouteSample } from "./crawler/pattern";

function cleanText(val: string | undefined | null): string {
  if (!val) return "";
  return val.replace(/\0/g, "").replace(/\u0000/g, "");
}

function cleanNullableText(val: string | undefined | null): string | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/\0/g, "").replace(/\u0000/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

interface ScanMetrics {
  healthyCount: number;
  warningCount: number;
  failedCount: number;
  totalConsoleErrors: number;
  totalFailedRequests: number;
  totalBrokenAssets: number;
  totalRuntimeErrors: number;
  failedPagesWithAi: Array<{
    path: string;
    aiAnalysis?: PageAiAnalysis | null;
    healthReasons?: string[];
  }>;
}


async function resolveEffectiveMaxPages(scan: typeof scans.$inferSelect, customMaxPages?: number): Promise<number> {
  if (customMaxPages) return customMaxPages;
  if (scan.summary?.options?.maxPages) return scan.summary.options.maxPages;

  if (scan.projectId) {
    const [project] = await db.select().from(projects).where(eq(projects.id, scan.projectId));
    if (project?.crawlerConfig?.maxPages) {
      return project.crawlerConfig.maxPages;
    }
  }

  return DEFAULT_MAX_PAGES || 100;
}


async function discoverInitialRoutes(
  scan: typeof scans.$inferSelect,
  maxPages: number,
  patternCounts: Map<string, number>,
): Promise<string[]> {
  logger.discover(`Crawling sitemaps and links for ${scan.targetUrl}...`);

  const discoveredUrls = new Set<string>();
  const rootUrl = normalizeUrl(scan.targetUrl);

  if (rootUrl) {
    discoveredUrls.add(rootUrl);
    recordRouteSample(getPathname(rootUrl), patternCounts);
  }

  const sitemapUrls = await discoverSitemapRoutes(scan.targetUrl);
  for (const url of sitemapUrls) {
    if (discoveredUrls.size >= maxPages) break;
    const path = getPathname(url);
    if (shouldSampleRoute(path, patternCounts, 1)) {
      recordRouteSample(path, patternCounts);
      discoveredUrls.add(url);
    }
  }

  logger.discover(`Discovered ${discoveredUrls.size} unique route templates from sitemap & root`);

  // Batch insert initial discovered routes
  const routeRecords = Array.from(discoveredUrls).map((url) => ({
    scanId: scan.id,
    url: cleanText(url),
    path: cleanText(getPathname(url)),
    status: "pending" as const,
  }));

  if (routeRecords.length > 0) {
    await db.insert(scanRoutes).values(routeRecords);
  }

  return Array.from(discoveredUrls);
}

async function persistPageTelemetry(pageResultId: string, testResult: PageTestResult): Promise<void> {
  const insertPromises: Promise<any>[] = [];

  if (testResult.consoleEvents.length > 0) {
    insertPromises.push(
      db.insert(consoleEvents).values(
        testResult.consoleEvents.map((e) => ({
          pageResultId,
          type: e.type,
          message: cleanText(e.message),
          location: cleanNullableText(e.location),
          stack: cleanNullableText(e.stack),
        })),
      ),
    );
  }

  if (testResult.runtimeErrors.length > 0) {
    insertPromises.push(
      db.insert(runtimeErrors).values(
        testResult.runtimeErrors.map((e) => ({
          pageResultId,
          errorType: e.errorType,
          message: cleanText(e.message),
          source: cleanNullableText(e.source),
          line: e.line,
          stack: cleanNullableText(e.stack),
        })),
      ),
    );
  }

  if (testResult.networkRequests.length > 0) {
    insertPromises.push(
      db.insert(networkRequests).values(
        testResult.networkRequests.map((r) => ({
          pageResultId,
          url: cleanText(r.url),
          method: r.method,
          status: r.status,
          resourceType: r.resourceType,
          durationMs: r.durationMs,
          failed: r.failed,
          failureReason: cleanNullableText(r.failureReason),
        })),
      ),
    );
  }

  if (insertPromises.length > 0) {
    await Promise.all(insertPromises);
  }
}

async function harvestInternalLinks(
  html: string,
  scan: typeof scans.$inferSelect,
  visited: Set<string>,
  queue: string[],
  patternCounts: Map<string, number>,
  effectiveMaxPages: number,
): Promise<void> {
  if (visited.size + queue.length >= effectiveMaxPages || !html) return;

  const newlyDiscovered = extractInternalLinks(html, scan.targetUrl);
  const newRoutesToInsert: Array<{
    scanId: string;
    url: string;
    path: string;
    status: "pending";
    discoveredVia: string;
  }> = [];

  for (const link of newlyDiscovered) {
    const linkPath = getPathname(link);
    if (
      !visited.has(link) &&
      !queue.includes(link) &&
      shouldSampleRoute(linkPath, patternCounts, 1) &&
      visited.size + queue.length < effectiveMaxPages
    ) {
      recordRouteSample(linkPath, patternCounts);
      queue.push(link);
      newRoutesToInsert.push({
        scanId: scan.id,
        url: cleanText(link),
        path: cleanText(linkPath),
        status: "pending",
        discoveredVia: "spider",
      });
    }
  }

  if (newRoutesToInsert.length > 0) {
    await db.insert(scanRoutes).values(newRoutesToInsert);
  }
}

async function finalizeScan(
  scan: typeof scans.$inferSelect,
  metrics: ScanMetrics,
  totalTested: number,
  durationSec: number,
): Promise<void> {
  logger.worker(`Analyzing regression differences against baseline...`);
  await detectRegressions(scan.id, scan.projectId);

  const healthScore = totalTested > 0 ? Math.round((metrics.healthyCount / totalTested) * 100) : 100;

  const scanAiSummary = generateScanAiSummary({
    targetUrl: scan.targetUrl,
    totalRoutes: totalTested,
    healthyRoutes: metrics.healthyCount,
    warningRoutes: metrics.warningCount,
    failedRoutes: metrics.failedCount,
    failedPages: metrics.failedPagesWithAi,
  });

  await db
    .update(scans)
    .set({
      status: "completed",
      completedAt: new Date(),
      healthScore,
      aiSummary: scanAiSummary,
      summary: {
        ...(scan.summary || {}),
        consoleErrors: metrics.totalConsoleErrors,
        failedRequests: metrics.totalFailedRequests,
        brokenAssets: metrics.totalBrokenAssets,
        runtimeErrors: metrics.totalRuntimeErrors,
      },
    })
    .where(eq(scans.id, scan.id as any));

  logger.complete(scan.targetUrl, {
    score: healthScore,
    total: totalTested,
    healthy: metrics.healthyCount,
    failed: metrics.failedCount,
    durationSec,
  });
}

// main
export async function runScan(scanId: string, customMaxPages?: number): Promise<void> {
  const [scan] = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId as any));
  if (!scan) return;

  const effectiveMaxPages = await resolveEffectiveMaxPages(scan, customMaxPages);
  addActiveJob({ scanId: scan.id, targetUrl: scan.targetUrl });
  const startTime = Date.now();

  logger.worker(`Initiating QA scan for: ${scan.targetUrl} (Max page ceiling: ${effectiveMaxPages})`);
  const engine = new BrowserEngine();

  try {
    // 1. Discovery Phase
    await db
      .update(scans)
      .set({ status: "discovering", startedAt: new Date() })
      .where(eq(scans.id, scanId as any));

    const patternCounts = new Map<string, number>();
    const initialUrls = await discoverInitialRoutes(scan, effectiveMaxPages, patternCounts);

    await db
      .update(scans)
      .set({
        status: "scanning",
        totalRoutes: initialUrls.length,
      })
      .where(eq(scans.id, scanId as any));

    // 2. Queue Execution Phase
    const queue = [...initialUrls];
    const visited = new Set<string>();

    const metrics: ScanMetrics = {
      healthyCount: 0,
      warningCount: 0,
      failedCount: 0,
      totalConsoleErrors: 0,
      totalFailedRequests: 0,
      totalBrokenAssets: 0,
      totalRuntimeErrors: 0,
      failedPagesWithAi: [],
    };

    const shouldRecordVideos = scan.summary?.options?.recordVideos !== false;

    while (queue.length > 0 && visited.size < effectiveMaxPages) {
      // Instant in-memory cancellation check (zero database latency)
      if (isScanCancelled(scan.id)) {
        logger.worker(`Scan [${scan.id}] cancelled. Stopping crawler immediately.`);
        break;
      }

      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      const routePath = getPathname(currentUrl);
      logger.test(visited.size, effectiveMaxPages, currentUrl);

      // Execute Playwright Browser Test
      const testResult = await engine.testRoute(currentUrl, {
        captureScreenshot: true,
        recordVideo: shouldRecordVideos,
        autoScroll: shouldRecordVideos,
      });

      const health = evaluatePageHealth(testResult, scan.targetUrl);

      // Track health metrics
      if (health.healthStatus === "healthy") {
        metrics.healthyCount++;
        logger.healthy(routePath, testResult.httpStatus, testResult.loadTimeMs);
      } else if (health.healthStatus === "warning") {
        metrics.warningCount++;
        logger.warning(routePath, health.healthReasons, testResult.httpStatus, testResult.loadTimeMs);
      } else {
        metrics.failedCount++;
        logger.failed(routePath, health.healthReasons, testResult.httpStatus, testResult.loadTimeMs);
      }

      metrics.totalConsoleErrors += health.consoleSummary.errors;
      metrics.totalFailedRequests += health.networkSummary.failed;
      metrics.totalBrokenAssets += health.networkSummary.assetsFailed;
      metrics.totalRuntimeErrors += testResult.runtimeErrors.length;

      const hasDegradedIssues =
        health.healthStatus !== "healthy" ||
        testResult.runtimeErrors.length > 0 ||
        health.consoleSummary.errors > 0 ||
        health.networkSummary.failed > 0;

      // PARALLEL PIPELINE: Run Cloudflare R2 uploads and Gemini AI Diagnosis concurrently!
      const [mediaKeys, pageAiDiagnosis] = await Promise.all([
        Promise.all([
          testResult.screenshotBuffer
            ? uploadScreenshot({
                buffer: testResult.screenshotBuffer,
                scanId: scan.id,
                routePath,
                contentType: "image/jpeg",
              })
            : Promise.resolve(undefined),
          testResult.videoBuffer
            ? uploadVideo({
                buffer: testResult.videoBuffer,
                scanId: scan.id,
                routePath,
              })
            : Promise.resolve(undefined),
        ]),
        hasDegradedIssues
          ? generatePageAiDiagnosis({
              routePath,
              url: currentUrl,
              httpStatus: testResult.httpStatus,
              healthStatus: health.healthStatus,
              healthReasons: health.healthReasons,
              renderingType: health.renderingType,
              consoleEvents: testResult.consoleEvents,
              runtimeErrors: testResult.runtimeErrors,
              networkRequests: testResult.networkRequests,
            })
          : Promise.resolve(undefined),
      ]);

      const [screenshotKey, videoKey] = mediaKeys;

      if (hasDegradedIssues && pageAiDiagnosis) {
        metrics.failedPagesWithAi.push({
          path: routePath,
          aiAnalysis: pageAiDiagnosis,
          healthReasons: health.healthReasons,
        });
      }

      // Persist Page Result
      const [savedPageResult] = await db
        .insert(pageResults)
        .values({
          scanId: scan.id,
          url: cleanText(currentUrl),
          path: cleanText(routePath),
          httpStatus: testResult.httpStatus,
          healthStatus: health.healthStatus,
          healthReasons: health.healthReasons.map(cleanText),
          renderingType: health.renderingType,
          loadTimeMs: testResult.loadTimeMs,
          screenshotUrl: screenshotKey,
          videoUrl: videoKey,
          aiAnalysis: pageAiDiagnosis,
          consoleSummary: health.consoleSummary,
          networkSummary: health.networkSummary,
        })
        .returning();

      // Parallel insert of child telemetry records
      if (savedPageResult) {
        await persistPageTelemetry(savedPageResult.id, testResult);
      }

      // Spider newly discovered links from page HTML
      await harvestInternalLinks(testResult.html, scan, visited, queue, patternCounts, effectiveMaxPages);

      // Update live progression in database
      await db
        .update(scans)
        .set({
          testedRoutes: visited.size,
          healthyRoutes: metrics.healthyCount,
          warningRoutes: metrics.warningCount,
          failedRoutes: metrics.failedCount,
          totalRoutes: visited.size + queue.length,
        })
        .where(eq(scans.id, scanId as any));
    }

    // Cancellation check
    if (isScanCancelled(scan.id)) {
      await db
        .update(scans)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(eq(scans.id, scanId as any));
      logger.worker(`Scan [${scan.id}] terminated and marked as cancelled.`);
      return;
    }

    // 3. Finalization Phase
    await db
      .update(scans)
      .set({ status: "analyzing" })
      .where(eq(scans.id, scanId as any));

    const durationSec = (Date.now() - startTime) / 1000;
    await finalizeScan(scan, metrics, visited.size, durationSec);
  } catch (error) {
    logger.error(`Scan failed for ${scan.targetUrl}:`, error);
    await db
      .update(scans)
      .set({
        status: "failed",
        completedAt: new Date(),
      })
      .where(eq(scans.id, scanId as any));
  } finally {
    removeActiveJob(scan.id);
    await engine.close();
  }
}
