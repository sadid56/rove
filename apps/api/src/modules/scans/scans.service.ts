import { db } from "@repo/database";
import {
  scans,
  scanRoutes,
  pageResults,
  consoleEvents,
  runtimeErrors,
  networkRequests,
  regressions
} from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";
import type { CreateScanInput } from "./scans.schemas";

export class ScansService {
  async create(input: CreateScanInput) {
    const [created] = await db
      .insert(scans)
      .values({
        targetUrl: input.targetUrl,
        projectId: input.projectId as any,
        status: "queued",
        summary: {
          consoleErrors: 0,
          failedRequests: 0,
          brokenAssets: 0,
          runtimeErrors: 0,
          renderingDistribution: {},
          options: input.options
        }
      })
      .returning();

    return created;
  }

  async list(projectId?: string) {
    if (projectId) {
      return db
        .select()
        .from(scans)
        .where(eq(scans.projectId, projectId as any))
        .orderBy(desc(scans.createdAt));
    }
    return db.select().from(scans).orderBy(desc(scans.createdAt));
  }

  async findById(id: string) {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id as any));
    if (!scan) return null;

    const routes = await db
      .select()
      .from(pageResults)
      .where(eq(pageResults.scanId, id as any))
      .orderBy(desc(pageResults.createdAt));

    const scanRegressions = await db
      .select()
      .from(regressions)
      .where(eq(regressions.currentScanId, id as any));

    return {
      ...scan,
      routes,
      regressions: scanRegressions
    };
  }

  async getPageDetail(pageResultId: string) {
    const [page] = await db
      .select()
      .from(pageResults)
      .where(eq(pageResults.id, pageResultId as any));

    if (!page) return null;

    const cEvents = await db
      .select()
      .from(consoleEvents)
      .where(eq(consoleEvents.pageResultId, pageResultId as any));

    const rErrors = await db
      .select()
      .from(runtimeErrors)
      .where(eq(runtimeErrors.pageResultId, pageResultId as any));

    const nRequests = await db
      .select()
      .from(networkRequests)
      .where(eq(networkRequests.pageResultId, pageResultId as any));

    return {
      ...page,
      consoleEvents: cEvents,
      runtimeErrors: rErrors,
      networkRequests: nRequests
    };
  }

  async updateStatus(
    id: string,
    status: "queued" | "discovering" | "scanning" | "analyzing" | "completed" | "failed" | "cancelled"
  ) {
    const [updated] = await db
      .update(scans)
      .set({
        status,
        ...(status === "completed" || status === "failed" || status === "cancelled"
          ? { completedAt: new Date() }
          : {})
      })
      .where(eq(scans.id, id as any))
      .returning();

    if (status === "cancelled") {
      const workerUrl = process.env.WORKER_URL || "http://localhost:4001";
      fetch(`${workerUrl}/jobs/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: id })
      }).catch(() => {});
    }

    return updated ?? null;
  }
}

export const scansService = new ScansService();
