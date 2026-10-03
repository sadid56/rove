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

  const { data: routesResponse, isLoading: isRoutesLoading } = useScanRoutes({
    id: scanId,
    healthStatus: (filter as any) || "all",
    page: routePage,
    pageSize: routePageSize,
  });

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

  const isScanning =
    scan.status === "scanning" ||
    scan.status === "discovering" ||
    scan.status === "queued";

  const routes = routesResponse?.items || scan.routes || [];
  const routesTotalCount = routesResponse?.totalCount ?? scan.totalRoutes;
  const routesTotalPages =
    routesResponse?.totalPages ??
    Math.max(1, Math.ceil(routesTotalCount / routePageSize));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ScanHeader
        scan={scan}
        isScanning={isScanning}
        isCancelling={isCancelling || cancelScanMutation.isPending}
        onStopScan={handleStopScan}
      />

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
