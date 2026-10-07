"use client";

import React, { useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useScans } from "@/react-query/scans/actions";
import { DashboardStats } from "./dashboard-stats";
import { QuickScanCard } from "./quick-scan-card";
import { RecentScansTable } from "./recent-scans-table";
import { PageHeader } from "@/components/common";

export function DashboardOverview() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(5));

  const { data: scansResponse, isLoading } = useScans({ page, pageSize });

  const scans = scansResponse?.items || [];
  const totalScans = scansResponse?.totalCount || 0;
  const totalPages = scansResponse?.totalPages || 1;

  // Compute metrics for the stats grid
  const statsData = useMemo(() => {
    const completedScans = scans.filter((s) => s.status === "completed");
    const averageHealth =
      completedScans.length > 0
        ? Math.round(completedScans.reduce((acc, s) => acc + (s.healthScore || 0), 0) / completedScans.length)
        : 100;

    const totalRoutesTested = completedScans.reduce((acc, s) => acc + (s.testedRoutes || 0), 0);
    const totalFailedIssues = completedScans.reduce((acc, s) => acc + (s.failedRoutes || 0), 0);

    return {
      averageHealth,
      completedScansCount: completedScans.length,
      totalScans,
      totalRoutesTested,
      totalFailedIssues,
    };
  }, [scans, totalScans]);

  return (
    <div className='space-y-8 w-full'>
      <PageHeader
        title="QA Intelligence Overview"
        description="Automated real-browser testing, route health analysis, and deployment regression monitoring."
      />

      {/* 1. Quick Launch Scan Card */}
      <QuickScanCard />

      {/* 2. Grid Metric Cards (Rendered via clean Array Loop) */}
      <DashboardStats stats={statsData} />

      {/* 3. Recent Scans Table */}
      <RecentScansTable
        scans={scans}
        isLoading={isLoading && !scansResponse}
        page={page}
        pageSize={pageSize}
        totalCount={totalScans}
        pageCount={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}
