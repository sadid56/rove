import { db } from "@repo/database";
import { scans, pageResults, regressions } from "@repo/database/schema";
import { eq, desc, and, ne } from "drizzle-orm";

export async function detectRegressions(currentScanId: string, projectId?: string | null): Promise<void> {
  if (!projectId) return;

  const [previousScan] = await db
    .select()
    .from(scans)
    .where(
      and(
        eq(scans.projectId, projectId as any),
        eq(scans.status, "completed"),
        ne(scans.id, currentScanId as any)
      )
    )
    .orderBy(desc(scans.createdAt))
    .limit(1);

  if (!previousScan) return;

  const prevPages = await db
    .select()
    .from(pageResults)
    .where(eq(pageResults.scanId, previousScan.id as any));

  const currPages = await db
    .select()
    .from(pageResults)
    .where(eq(pageResults.scanId, currentScanId as any));

  const prevMap = new Map(prevPages.map((p) => [p.path, p]));

  for (const curr of currPages) {
    const prev = prevMap.get(curr.path);
    if (!prev) continue;

    if (curr.healthStatus === "failed" && prev.healthStatus !== "failed") {
      await db.insert(regressions).values({
        currentScanId: currentScanId as any,
        previousScanId: previousScan.id as any,
        path: curr.path,
        changeType: "new_failure",
        details: {
          previousValue: prev.healthStatus,
          currentValue: curr.healthStatus,
          evidence: (curr.healthReasons as string[])?.join("; ") || "Page became unhealthy"
        }
      });
    } else if (curr.healthStatus === "healthy" && prev.healthStatus === "failed") {
      await db.insert(regressions).values({
        currentScanId: currentScanId as any,
        previousScanId: previousScan.id as any,
        path: curr.path,
        changeType: "resolved",
        details: {
          previousValue: prev.healthStatus,
          currentValue: curr.healthStatus,
          evidence: "Issue resolved in current deployment"
        }
      });
    } else if (
      prev.loadTimeMs &&
      curr.loadTimeMs &&
      curr.loadTimeMs > 2000 &&
      curr.loadTimeMs > prev.loadTimeMs * 2
    ) {
      await db.insert(regressions).values({
        currentScanId: currentScanId as any,
        previousScanId: previousScan.id as any,
        path: curr.path,
        changeType: "performance_degradation",
        details: {
          previousValue: `${prev.loadTimeMs}ms`,
          currentValue: `${curr.loadTimeMs}ms`,
          evidence: `Load time increased by ${Math.round((curr.loadTimeMs / prev.loadTimeMs - 1) * 100)}%`
        }
      });
    }
  }
}
