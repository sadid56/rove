import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { client } from "@/lib/orpc";
import { scansKeys } from "./keys";

export interface ScanRoute {
  id: string;
  scanId: string;
  url: string;
  path: string;
  httpStatus: number | null;
  healthStatus: "healthy" | "warning" | "failed";
  healthReasons: string[];
  renderingType: "static" | "isr" | "ssr" | "client-dynamic" | "unknown";
  loadTimeMs: number | null;
  screenshotUrl?: string;
  consoleSummary?: { logs: number; warnings: number; errors: number };
  networkSummary?: { total: number; failed: number; apiFailed: number; assetsFailed: number };
}

export interface RegressionItem {
  id: string;
  path: string;
  changeType: "new_failure" | "resolved" | "status_change" | "performance_degradation" | "rendering_change";
  details?: {
    previousValue?: string | number | null;
    currentValue?: string | number | null;
    evidence?: string;
  };
}

export interface ScanDetail {
  id: string;
  projectId?: string;
  targetUrl: string;
  status: "queued" | "discovering" | "scanning" | "analyzing" | "completed" | "failed" | "cancelled";
  healthScore?: number;
  totalRoutes: number;
  testedRoutes: number;
  healthyRoutes: number;
  warningRoutes: number;
  failedRoutes: number;
  summary?: {
    consoleErrors?: number;
    failedRequests?: number;
    brokenAssets?: number;
    runtimeErrors?: number;
    renderingDistribution?: Record<string, number>;
  };
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  routes: ScanRoute[];
  regressions?: RegressionItem[];
}

export interface PageDetailInspection extends ScanRoute {
  consoleEvents: {
    id: string;
    type: "error" | "warn" | "info" | "log";
    message: string;
    location?: string;
    stack?: string;
    timestamp?: string;
  }[];
  runtimeErrors: {
    id: string;
    errorType: "uncaught" | "unhandled_rejection" | "hydration";
    message: string;
    source?: string;
    line?: number;
    stack?: string;
  }[];
  networkRequests: {
    id: string;
    url: string;
    method: string;
    status?: number;
    resourceType: string;
    durationMs?: number;
    failed: boolean;
    failureReason?: string;
  }[];
}

export function useScans(projectId?: string) {
  return useQuery({
    queryKey: scansKeys.lists(projectId),
    queryFn: () => client.scans.list(projectId ? { projectId } : undefined) as Promise<ScanDetail[]>,
    refetchInterval: 4000
  });
}

export function useScan(id: string) {
  return useQuery({
    queryKey: scansKeys.detail(id),
    queryFn: () => client.scans.get({ id }) as Promise<ScanDetail>,
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed" || data?.status === "cancelled") {
        return false;
      }
      return 3000;
    }
  });
}

export function usePageDetail(pageId: string) {
  return useQuery({
    queryKey: scansKeys.page(pageId),
    queryFn: () => client.scans.getPageDetail({ pageId }) as Promise<PageDetailInspection>,
    enabled: Boolean(pageId)
  });
}

export function useTriggerScan() {
  return useAppMutation<{ targetUrl: string; projectId?: string }>({
    mutationFn: (data) => client.scans.create(data),
    invalidateKeys: [["scans"]],
    successMessage: "Scan started successfully",
    errorMessage: "Failed to start scan"
  });
}

export function useCancelScan() {
  return useAppMutation<{ id: string }>({
    mutationFn: (data) => client.scans.updateStatus({ id: data.id, status: "cancelled" }),
    invalidateKeys: [["scans"]],
    successMessage: "Scan stopped successfully",
    errorMessage: "Failed to stop scan"
  });
}
