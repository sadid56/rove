"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import {
  useScan,
  usePageDetail,
  useCancelScan,
  useScanRoutes,
  type ScanRoute,
} from "@/react-query/scans/actions";
import { cancelScan } from "../actions";
import { ScanSkeleton } from "./scan-skeleton";
import { ScanHeader } from "./scan-header";
import { ScanMetrics } from "./scan-metrics";
import { ScanRegressions } from "./scan-regressions";
import { ScanRouteTable } from "./scan-route-table";
import { ScanRouteInspector } from "./scan-route-inspector";
import { Sparkles } from "lucide-react";

const LIVE_STATUSES = new Set(["scanning", "discovering", "queued"]);
const DEFAULT_PAGE_SIZE = 10;
const ROUTE_POLL_MS = 2000;

type AiSummary = {
  criticalIssuesCount: number;
  overallHealthAssessment: string;
  topRiskAreas?: string[];
  recommendedActions?: string[];
};

function AiSummaryCard({ summary }: { summary: AiSummary }) {
  const { criticalIssuesCount, overallHealthAssessment, topRiskAreas, recommendedActions } = summary;
  const hasRisks = criticalIssuesCount > 0;

  return (
    <div className='p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-primary' />
          <h3 className='text-sm font-semibold text-foreground'>AI Autonomous Executive Summary</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            hasRisks
              ? "bg-destructive/20 text-destructive border-destructive/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {hasRisks ? `${criticalIssuesCount} High Risk Route(s)` : "All Routes Healthy"}
        </span>
      </div>

      <p className='text-xs text-muted-foreground leading-relaxed'>{overallHealthAssessment}</p>

      {!!topRiskAreas?.length && (
        <div className='space-y-1.5 pt-1'>
          <span className='text-[11px] font-semibold text-foreground block'>Key Risk Areas:</span>
          <div className='flex flex-wrap gap-1.5'>
            {topRiskAreas.map((risk, i) => (
              <span key={i} className='px-2 py-1 rounded-md text-[11px] bg-background/80 border border-border text-foreground font-mono'>
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {!!recommendedActions?.length && (
        <div className='text-[11px] text-muted-foreground pt-1 border-t border-border/50'>
          <span className='font-semibold text-foreground'>Recommended Action: </span>
          {recommendedActions.join(" ")}
        </div>
      )}
    </div>
  );
}


export function ScanDetailView({ scanId }: { scanId: string }) {
  const [selectedRoute, setSelectedRoute] = useState<ScanRoute | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: scan, isLoading, refetch } = useScan(scanId);
  const cancelScanMutation = useCancelScan();

  // URL-synced state (nuqs)
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));
  const [filter, setFilter] = useQueryState("status", parseAsString.withDefault("all"));

  const isScanning = LIVE_STATUSES.has(scan?.status ?? "");

  const {
    data: routesResponse,
    isLoading: isRoutesLoading,
    refetch: refetchRoutes,
  } = useScanRoutes(
    { id: scanId, healthStatus: (filter as any) || "all", page, pageSize },
    { refetchInterval: isScanning ? ROUTE_POLL_MS : false },
  );

  useEffect(() => {
    refetchRoutes();
  }, [scan?.status, scan?.testedRoutes, refetchRoutes]);

  const { data: pageDetail, isLoading: isDetailLoading } = usePageDetail(selectedRoute?.id ?? "");

  const fallbackRoutes = useMemo(() => {
    const all = scan?.routes ?? [];
    if (!all.length) return [];
    if (!filter || filter === "all") return all;
    return all.filter((r) => r.healthStatus === filter);
  }, [scan?.routes, filter]);

  const routes = routesResponse?.items?.length ? routesResponse.items : fallbackRoutes;

  const totalCount = routesResponse?.totalCount || fallbackRoutes.length || scan?.testedRoutes || scan?.totalRoutes || 0;

  const totalPages = routesResponse?.totalPages || Math.max(1, Math.ceil(totalCount / pageSize));

  const handleFilterChange = (next: string) => {
    setFilter(next);
    setPage(1);
  };

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPage(1);
  };

  const handleStopScan = async () => {
    try {
      setIsCancelling(true);
      await cancelScan(scanId);
      await refetch();
    } catch {
      await cancelScanMutation.mutateAsync({ id: scanId });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading && !scan) return <ScanSkeleton />;

  if (!scan) {
    return (
      <div className='text-center py-20'>
        <h2 className='text-lg font-semibold'>Scan Report Not Found</h2>
        <Link href='/dashboard' className='text-primary text-sm mt-2 inline-block hover:underline'>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-7xl mx-auto pb-12'>
      <ScanHeader
        scan={scan}
        isScanning={isScanning}
        isCancelling={isCancelling || cancelScanMutation.isPending}
        onStopScan={handleStopScan}
      />

      {scan.aiSummary && <AiSummaryCard summary={scan.aiSummary} />}

      <ScanRegressions regressions={scan.regressions} />

      <ScanMetrics scan={scan} />

      <ScanRouteTable
        routes={routes}
        totalRoutes={scan.totalRoutes}
        failedRoutes={scan.failedRoutes}
        warningRoutes={scan.warningRoutes}
        healthyRoutes={scan.healthyRoutes}
        filter={(filter as any) || "all"}
        onFilterChange={handleFilterChange}
        onSelectRoute={setSelectedRoute}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        pageCount={totalPages}
        isLoading={isRoutesLoading}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <ScanRouteInspector
        selectedRoute={selectedRoute}
        pageDetail={pageDetail}
        isLoading={isDetailLoading}
        onClose={() => setSelectedRoute(null)}
      />
    </div>
  );
}