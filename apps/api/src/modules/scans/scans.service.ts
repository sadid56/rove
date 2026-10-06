import { db, generatePageAiDiagnosis, QueryBuilder } from "@repo/database";
import { scans, pageResults, consoleEvents, runtimeErrors, networkRequests, regressions } from "@repo/database/schema";
import { eq, desc } from "drizzle-orm";
import type { CreateScanInput } from "@repo/contract";
import { WORKER_URL } from "@repo/config";

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
          options: input.options,
        },
      })
      .returning();

    return created;
  }

  async list(query?: { projectId?: string; search?: string; page?: number; pageSize?: number }) {
    return QueryBuilder.from(db, scans)
      .whereIf(Boolean(query?.projectId), () => eq(scans.projectId, query!.projectId as any))
      .search(query?.search, [scans.targetUrl])
      .orderBy(desc(scans.createdAt))
      .paginate({ page: query?.page, pageSize: query?.pageSize })
      .execute();
  }

  async listRoutes(query: {
    id: string;
    search?: string;
    healthStatus?: "all" | "healthy" | "warning" | "failed";
    page?: number;
    pageSize?: number;
  }) {
    const healthFilter =
      query.healthStatus && query.healthStatus !== "all" ? (query.healthStatus as "healthy" | "warning" | "failed") : undefined;

    return QueryBuilder.from(db, pageResults)
      .where(eq(pageResults.scanId, query.id as any))
      .whereIf(Boolean(healthFilter), () => eq(pageResults.healthStatus, healthFilter!))
      .search(query.search, [pageResults.path, pageResults.url])
      .orderBy(desc(pageResults.createdAt))
      .paginate({ page: query.page, pageSize: query.pageSize })
      .execute();
  }

  async findById(id: string) {
    const scan = await QueryBuilder.from(db, scans)
      .where(eq(scans.id, id as any))
      .findFirst();

    if (!scan) return null;

    const routes = await QueryBuilder.from(db, pageResults)
      .where(eq(pageResults.scanId, id as any))
      .orderBy(desc(pageResults.createdAt))
      .findMany();

    const scanRegressions = await QueryBuilder.from(db, regressions)
      .where(eq(regressions.currentScanId, id as any))
      .findMany();

    return {
      ...scan,
      routes,
      regressions: scanRegressions,
    };
  }

  async getPageDetail(pageResultId: string) {
    const page = await QueryBuilder.from(db, pageResults)
      .where(eq(pageResults.id, pageResultId as any))
      .findFirst();

    if (!page) return null;

    const [cEvents, rErrors, nRequests] = await Promise.all([
      QueryBuilder.from(db, consoleEvents)
        .where(eq(consoleEvents.pageResultId, pageResultId as any))
        .findMany(),
      QueryBuilder.from(db, runtimeErrors)
        .where(eq(runtimeErrors.pageResultId, pageResultId as any))
        .findMany(),
      QueryBuilder.from(db, networkRequests)
        .where(eq(networkRequests.pageResultId, pageResultId as any))
        .findMany(),
    ]);

    return {
      ...page,
      consoleEvents: cEvents,
      runtimeErrors: rErrors,
      networkRequests: nRequests,
    };
  }

  async analyzePageWithAi(pageId: string) {
    const pageDetail = await this.getPageDetail(pageId);
    if (!pageDetail) return null;

    const diagnosis = await generatePageAiDiagnosis({
      routePath: pageDetail.path,
      url: pageDetail.url,
      httpStatus: pageDetail.httpStatus,
      healthStatus: pageDetail.healthStatus as any,
      healthReasons: pageDetail.healthReasons || [],
      renderingType: pageDetail.renderingType,
      consoleEvents: pageDetail.consoleEvents,
      runtimeErrors: pageDetail.runtimeErrors,
      networkRequests: pageDetail.networkRequests,
    });

    await db
      .update(pageResults)
      .set({ aiAnalysis: diagnosis })
      .where(eq(pageResults.id, pageId as any));

    return {
      ...pageDetail,
      aiAnalysis: diagnosis,
    };
  }

  async updateStatus(id: string, status: "queued" | "discovering" | "scanning" | "analyzing" | "completed" | "failed" | "cancelled") {
    const [updated] = await db
      .update(scans)
      .set({
        status,
        ...(status === "completed" || status === "failed" || status === "cancelled" ? { completedAt: new Date() } : {}),
      })
      .where(eq(scans.id, id as any))
      .returning();

    if (status === "cancelled") {
      const workerUrl = WORKER_URL;
      fetch(`${workerUrl}/jobs/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId: id }),
      }).catch(() => {});
    }

    return updated ?? null;
  }
}

export const scansService = new ScansService();
