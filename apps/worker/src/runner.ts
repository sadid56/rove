import { db } from "@repo/database";
import { scans, projects, scanRoutes, pageResults, consoleEvents, runtimeErrors, networkRequests } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { normalizeUrl, getPathname } from "./crawler/normalizer";
import { discoverSitemapRoutes } from "./crawler/sitemap";
import { extractInternalLinks } from "./crawler/spider";
import { BrowserEngine } from "./browser/engine";
import { evaluatePageHealth } from "./analyzers/health";
import { detectRegressions } from "./analyzers/regression";
import { logger } from "./utils/logger";
import { addActiveJob, removeActiveJob, isScanCancelled, markScanCancelled } from "./server";
import { uploadScreenshot } from "./storage/r2";
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

export async function runScan(scanId: string, customMaxPages?: number): Promise<void> {
  const [scan] = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId as any));
  if (!scan) return;

  let effectiveMaxPages = customMaxPages || Number(process.env.DEFAULT_MAX_PAGES || 100);

  if (scan.projectId) {
    const [project] = await db.select().from(projects).where(eq(projects.id, scan.projectId));
    if (project?.crawlerConfig?.maxPages) {
      effectiveMaxPages = project.crawlerConfig.maxPages;
    }
  }

  if (scan.summary?.options?.maxPages) {
    effectiveMaxPages = scan.summary.options.maxPages;
  }

  addActiveJob({ scanId: scan.id, targetUrl: scan.targetUrl });
  const startTime = Date.now();
  logger.worker(`Initiating QA scan for: ${scan.targetUrl} (Max page ceiling: ${effectiveMaxPages})`);

  const engine = new BrowserEngine();

  try {
    await db
      .update(scans)
      .set({ status: "discovering", startedAt: new Date() })
      .where(eq(scans.id, scanId as any));

    logger.discover(`Crawling sitemaps and links for ${scan.targetUrl}...`);

    const patternCounts = new Map<string, number>();
    const maxSamplesPerPattern = 1;

    const discoveredUrls = new Set<string>();
    const rootUrl = normalizeUrl(scan.targetUrl);
    if (rootUrl) {
      discoveredUrls.add(rootUrl);
      recordRouteSample(getPathname(rootUrl), patternCounts);
    }

    const sitemapUrls = await discoverSitemapRoutes(scan.targetUrl);
    for (const url of sitemapUrls) {
      if (discoveredUrls.size >= effectiveMaxPages) break;
      const path = getPathname(url);
      if (shouldSampleRoute(path, patternCounts, maxSamplesPerPattern)) {
        recordRouteSample(path, patternCounts);
        discoveredUrls.add(url);
      }
    }

    logger.discover(`Discovered ${discoveredUrls.size} unique route templates from sitemap & root`);

    const routeRecords: { scanId: any; url: string; path: string; status: any }[] = [];
    for (const url of discoveredUrls) {
      routeRecords.push({
        scanId: scan.id,
        url: cleanText(url),
        path: cleanText(getPathname(url)),
        status: "pending",
      });
    }

    if (routeRecords.length > 0) {
      await db.insert(scanRoutes).values(routeRecords);
    }

    await db
      .update(scans)
      .set({
        status: "scanning",
        totalRoutes: discoveredUrls.size,
      })
      .where(eq(scans.id, scanId as any));

    const queue = Array.from(discoveredUrls);
    const visited = new Set<string>();

    let healthyCount = 0;
    let warningCount = 0;
    let failedCount = 0;
    let totalConsoleErrors = 0;
    let totalFailedRequests = 0;
    let totalBrokenAssets = 0;
    let totalRuntimeErrors = 0;

    while (queue.length > 0 && visited.size < effectiveMaxPages) {
      if (isScanCancelled(scan.id)) {
        logger.worker(`Scan [${scan.id}] cancelled. Stopping crawler immediately.`);
        break;
      }

      const [currentStatus] = await db
        .select({ status: scans.status })
        .from(scans)
        .where(eq(scans.id, scanId as any));
      if (currentStatus?.status === "cancelled") {
        logger.worker(`Scan [${scan.id}] marked as cancelled in database. Stopping crawler.`);
        markScanCancelled(scan.id);
        break;
      }

      const currentUrl = queue.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      logger.test(visited.size, effectiveMaxPages, currentUrl);

      const testResult = await engine.testRoute(currentUrl, true);
      const health = evaluatePageHealth(testResult, scan.targetUrl);

      if (health.healthStatus === "healthy") {
        healthyCount++;
        logger.healthy(getPathname(currentUrl), testResult.httpStatus, testResult.loadTimeMs);
      } else if (health.healthStatus === "warning") {
        warningCount++;
        logger.warning(getPathname(currentUrl), health.healthReasons, testResult.httpStatus, testResult.loadTimeMs);
      } else {
        failedCount++;
        logger.failed(getPathname(currentUrl), health.healthReasons, testResult.httpStatus, testResult.loadTimeMs);
      }

      totalConsoleErrors += health.consoleSummary.errors;
      totalFailedRequests += health.networkSummary.failed;
      totalBrokenAssets += health.networkSummary.assetsFailed;
      totalRuntimeErrors += testResult.runtimeErrors.length;

      let screenshotKey: string | undefined;
      if (testResult.screenshotBuffer) {
        screenshotKey = await uploadScreenshot({
          buffer: testResult.screenshotBuffer,
          scanId: scan.id,
          routePath: getPathname(currentUrl),
          contentType: "image/jpeg",
        });
      }

      const [savedPageResult] = await db
        .insert(pageResults)
        .values({
          scanId: scan.id,
          url: cleanText(currentUrl),
          path: cleanText(getPathname(currentUrl)),
          httpStatus: testResult.httpStatus,
          healthStatus: health.healthStatus,
          healthReasons: health.healthReasons.map((r) => cleanText(r)),
          renderingType: health.renderingType,
          loadTimeMs: testResult.loadTimeMs,
          screenshotUrl: screenshotKey,
          consoleSummary: health.consoleSummary,
          networkSummary: health.networkSummary,
        })
        .returning();

      if (savedPageResult) {
        if (testResult.consoleEvents.length > 0) {
          await db.insert(consoleEvents).values(
            testResult.consoleEvents.map((e) => ({
              pageResultId: savedPageResult.id,
              type: e.type,
              message: cleanText(e.message),
              location: cleanNullableText(e.location),
              stack: cleanNullableText(e.stack),
            })),
          );
        }

        if (testResult.runtimeErrors.length > 0) {
          await db.insert(runtimeErrors).values(
            testResult.runtimeErrors.map((e) => ({
              pageResultId: savedPageResult.id,
              errorType: e.errorType,
              message: cleanText(e.message),
              source: cleanNullableText(e.source),
              line: e.line,
              stack: cleanNullableText(e.stack),
            })),
          );
        }

        if (testResult.networkRequests.length > 0) {
          await db.insert(networkRequests).values(
            testResult.networkRequests.map((r) => ({
              pageResultId: savedPageResult.id,
              url: cleanText(r.url),
              method: r.method,
              status: r.status,
              resourceType: r.resourceType,
              durationMs: r.durationMs,
              failed: r.failed,
              failureReason: cleanNullableText(r.failureReason),
            })),
          );
        }
      }

      if (visited.size < effectiveMaxPages && testResult.html) {
        const newlyDiscovered = extractInternalLinks(testResult.html, scan.targetUrl);
        for (const link of newlyDiscovered) {
          const linkPath = getPathname(link);
          if (
            !visited.has(link) &&
            !queue.includes(link) &&
            shouldSampleRoute(linkPath, patternCounts, maxSamplesPerPattern) &&
            visited.size + queue.length < effectiveMaxPages
          ) {
            recordRouteSample(linkPath, patternCounts);
            queue.push(link);
            await db.insert(scanRoutes).values({
              scanId: scan.id,
              url: cleanText(link),
              path: cleanText(linkPath),
              status: "pending",
              discoveredVia: "spider",
            });
          }
        }
      }

      await db
        .update(scans)
        .set({
          testedRoutes: visited.size,
          healthyRoutes: healthyCount,
          warningRoutes: warningCount,
          failedRoutes: failedCount,
          totalRoutes: visited.size + queue.length,
        })
        .where(eq(scans.id, scanId as any));
    }

    if (isScanCancelled(scan.id)) {
      await db
        .update(scans)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(eq(scans.id, scanId as any));
      logger.worker(`Scan [${scan.id}] terminated and marked as cancelled.`);
      return;
    }

    await db
      .update(scans)
      .set({ status: "analyzing" })
      .where(eq(scans.id, scanId as any));

    logger.worker(`Analyzing regression differences against baseline...`);
    await detectRegressions(scan.id, scan.projectId);

    const totalTested = visited.size;
    const healthScore = totalTested > 0 ? Math.round((healthyCount / totalTested) * 100) : 100;
    const durationSec = (Date.now() - startTime) / 1000;

    await db
      .update(scans)
      .set({
        status: "completed",
        completedAt: new Date(),
        healthScore,
        summary: {
          ...(scan.summary || {}),
          consoleErrors: totalConsoleErrors,
          failedRequests: totalFailedRequests,
          brokenAssets: totalBrokenAssets,
          runtimeErrors: totalRuntimeErrors,
        },
      })
      .where(eq(scans.id, scanId as any));

    logger.complete(scan.targetUrl, {
      score: healthScore,
      total: totalTested,
      healthy: healthyCount,
      failed: failedCount,
      durationSec,
    });
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
