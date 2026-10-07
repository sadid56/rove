import React from "react";
import { CheckCircle2, AlertTriangle, Terminal, AlertOctagon } from "lucide-react";
import { StatCard } from "@/components/common";
import type { ScanDetail } from "@/react-query/scans/actions";

interface ScanMetricsProps {
  scan: ScanDetail;
}

export function ScanMetrics({ scan }: ScanMetricsProps) {
  const brokenCount =
    (scan.summary?.failedRequests ?? 0) + (scan.summary?.brokenAssets ?? 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        label="Healthy Routes"
        value={scan.healthyRoutes}
        icon={<CheckCircle2 className="w-4 h-4" />}
        valueClass="text-success"
        iconClass="text-success"
        description="Passed all assertions"
      />
      <StatCard
        label="Failed Routes"
        value={scan.failedRoutes}
        icon={<AlertTriangle className="w-4 h-4" />}
        valueClass={scan.failedRoutes > 0 ? "text-destructive" : "text-foreground"}
        iconClass={scan.failedRoutes > 0 ? "text-destructive" : "text-muted-foreground"}
        description="Requires attention"
      />
      <StatCard
        label="Console Errors"
        value={scan.summary?.consoleErrors ?? 0}
        icon={<Terminal className="w-4 h-4" />}
        valueClass={(scan.summary?.consoleErrors ?? 0) > 0 ? "text-warning" : "text-foreground"}
        iconClass={(scan.summary?.consoleErrors ?? 0) > 0 ? "text-warning" : "text-muted-foreground"}
        description="Captured during crawl"
      />
      <StatCard
        label="Broken Assets / 5xx"
        value={brokenCount}
        icon={<AlertOctagon className="w-4 h-4" />}
        valueClass={brokenCount > 0 ? "text-primary" : "text-foreground"}
        iconClass="text-primary"
        description="Failed requests & asset loads"
      />
    </div>
  );
}
