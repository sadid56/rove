import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@repo/ui";
import type { ScanDetail } from "@/react-query/scans/actions";

interface ScanMetricsProps {
  scan: ScanDetail;
}

export function ScanMetrics({ scan }: ScanMetricsProps) {
  const brokenCount =
    (scan.summary?.failedRequests ?? 0) + (scan.summary?.brokenAssets ?? 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-1">
          <CardDescription className="text-xs">Healthy Routes</CardDescription>
          <CardTitle className="text-2xl text-success">
            {scan.healthyRoutes}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardDescription className="text-xs">Failed Routes</CardDescription>
          <CardTitle className="text-2xl text-destructive">
            {scan.failedRoutes}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardDescription className="text-xs">Console Errors</CardDescription>
          <CardTitle className="text-2xl text-warning">
            {scan.summary?.consoleErrors ?? 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardDescription className="text-xs">Broken Assets / 5xx</CardDescription>
          <CardTitle className="text-2xl text-primary">
            {brokenCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
