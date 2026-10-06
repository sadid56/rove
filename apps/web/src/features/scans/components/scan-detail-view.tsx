"use client";

import React, { useState } from "react";
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

export function ScanDetailView({ scanId }: { scanId: string }) {

  const { data: scan, isLoading, refetch } = useScan(scanId);
  const cancelScanMutation = useCancelScan();
  const [selectedRoute, setSelectedRoute] = useState<ScanRoute | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // URL query state synced with nuqs
  const [routePage, setRoutePage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [routePageSize, setRoutePageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [filter, setFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all")
  );

  const isScanning = scan?.status === "scanning" || scan?.status === "discovering" || scan?.status === "queued";

  const {
    data: routesResponse,
    isLoading: isRoutesLoading,
    refetch: refetchRoutes,
  } = useScanRoutes(
    {
      id: scanId,
      healthStatus: (filter as any) || "all",
      page: routePage,
      pageSize: routePageSize,
    },
    {
      refetchInterval: isScanning ? 2000 : false,
    },
  );

  React.useEffect(() => {
    refetchRoutes();
  }, [scan?.status, scan?.testedRoutes, refetchRoutes]);

  const { data: pageDetail, isLoading: isDetailLoading } = usePageDetail(
    selectedRoute?.id || ""
  );

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

  if (isLoading && !scan) {
    return <ScanSkeleton />;
  }

  if (!scan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Scan Report Not Found</h2>
        <Link
          href="/dashboard"
          className="text-primary text-sm mt-2 inline-block hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const fallbackRoutes =
    !scan.routes || scan.routes.length === 0
      ? []
      : !filter || filter === "all"
        ? scan.routes
        : scan.routes.filter((r) => r.healthStatus === filter);

  const routes = routesResponse?.items && routesResponse.items.length > 0 ? routesResponse.items : fallbackRoutes;

  const routesTotalCount =
    routesResponse?.totalCount !== undefined && routesResponse.totalCount > 0
      ? routesResponse.totalCount
      : fallbackRoutes.length || scan.testedRoutes || scan.totalRoutes || 0;

  const routesTotalPages =
    routesResponse?.totalPages !== undefined && routesResponse.totalPages > 0
      ? routesResponse.totalPages
      : Math.max(1, Math.ceil(routesTotalCount / routePageSize));

  return (
    <div className='space-y-6 max-w-7xl mx-auto pb-12'>
      <ScanHeader
        scan={scan}
        isScanning={isScanning}
        isCancelling={isCancelling || cancelScanMutation.isPending}
        onStopScan={handleStopScan}
      />

      {scan.aiSummary && (
        <div className='p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-primary' />
              <h3 className='text-sm font-semibold text-foreground'>AI Autonomous Executive Summary</h3>
            </div>
            {scan.aiSummary.criticalIssuesCount > 0 ? (
              <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/30'>
                {scan.aiSummary.criticalIssuesCount} High Risk Route(s)
              </span>
            ) : (
              <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                All Routes Healthy
              </span>
            )}
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>{scan.aiSummary.overallHealthAssessment}</p>
          {scan.aiSummary.topRiskAreas && scan.aiSummary.topRiskAreas.length > 0 && (
            <div className='space-y-1.5 pt-1'>
              <span className='text-[11px] font-semibold text-foreground block'>Key Risk Areas:</span>
              <div className='flex flex-wrap gap-1.5'>
                {scan.aiSummary.topRiskAreas.map((risk, i) => (
                  <span
                    key={i}
                    className='px-2 py-1 rounded-md text-[11px] bg-background/80 border border-border text-foreground font-mono'
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
          {scan.aiSummary.recommendedActions && scan.aiSummary.recommendedActions.length > 0 && (
            <div className='text-[11px] text-muted-foreground pt-1 border-t border-border/50'>
              <span className='font-semibold text-foreground'>Recommended Action: </span>
              {scan.aiSummary.recommendedActions.join(" ")}
            </div>
          )}
        </div>
      )}

      <ScanRegressions regressions={scan.regressions} />

      <ScanMetrics scan={scan} />

      <ScanRouteTable
        routes={routes}
        totalRoutes={scan.totalRoutes}
        failedRoutes={scan.failedRoutes}
        warningRoutes={scan.warningRoutes}
        healthyRoutes={scan.healthyRoutes}
        filter={(filter as any) || "all"}
        onFilterChange={(newFilter) => {
          setFilter(newFilter);
          setRoutePage(1);
        }}
        onSelectRoute={setSelectedRoute}
        page={routePage}
        pageSize={routePageSize}
        totalCount={routesTotalCount}
        pageCount={routesTotalPages}
        isLoading={isRoutesLoading}
        onPageChange={(newPage) => setRoutePage(newPage)}
        onPageSizeChange={(newPageSize) => {
          setRoutePageSize(newPageSize);
          setRoutePage(1);
        }}
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
