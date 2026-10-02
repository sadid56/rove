"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Code2,
  Terminal,
  Activity,
  Image as ImageIcon,
  Flame,
  FileX,
  Square
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Sheet,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton
} from "@repo/ui";
import { useScan, usePageDetail, useCancelScan, type ScanRoute } from "@/react-query/scans/actions";
import { getMediaUrl } from "@/lib/media";

export default function ScanReportPage() {
  const params = useParams();
  const scanId = params.id as string;

  const { data: scan, isLoading } = useScan(scanId);
  const cancelScan = useCancelScan();
  const [selectedRoute, setSelectedRoute] = useState<ScanRoute | null>(null);
  const [filter, setFilter] = useState<"all" | "failed" | "warning" | "healthy">("all");

  const { data: pageDetail, isLoading: isDetailLoading } = usePageDetail(selectedRoute?.id || "");

  const handleStopScan = async () => {
    try {
      await cancelScan.mutateAsync({ id: scanId });
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-64 rounded-lg" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 py-3">Route Path</TableHead>
                <TableHead className="px-4 py-3">HTTP Status</TableHead>
                <TableHead className="px-4 py-3">Health</TableHead>
                <TableHead className="px-4 py-3">Rendering</TableHead>
                <TableHead className="px-4 py-3">Load Time</TableHead>
                <TableHead className="px-4 py-3">Issues</TableHead>
                <TableHead className="px-5 py-3 text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-5 py-3.5">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right">
                    <Skeleton className="h-8 w-24 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Scan Report Not Found</h2>
        <Link href="/dashboard" className="text-primary text-sm mt-2 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const routes = scan.routes || [];
  const filteredRoutes = routes.filter((r) => {
    if (filter === "all") return true;
    return r.healthStatus === filter;
  });

  const isScanning = scan.status === "scanning" || scan.status === "discovering" || scan.status === "queued";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scans
        </Link>
        {isScanning && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Scanner Active: {scan.status.toUpperCase()}
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStopScan}
              disabled={cancelScan.isPending}
              leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
            >
              {cancelScan.isPending ? "Stopping..." : "Stop Scan"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono truncate max-w-xl">
              {scan.targetUrl}
            </h1>
            <Badge
              variant={
                scan.status === "completed"
                  ? "healthy"
                  : scan.status === "failed"
                    ? "failed"
                    : scan.status === "cancelled"
                      ? "warning"
                      : "info"
              }
              dot
            >
              {scan.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Initiated on {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-secondary/40 border border-border px-4 py-2.5 rounded-xl">
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Health Score</span>
            <span
              className={`text-2xl font-bold font-mono ${
                (scan.healthScore || 0) >= 90
                  ? "text-emerald-400"
                  : (scan.healthScore || 0) >= 70
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {scan.healthScore !== null && scan.healthScore !== undefined ? `${scan.healthScore}%` : "—"}
            </span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="text-[10px] font-mono uppercase text-muted-foreground block">Progress</span>
            <span className="text-sm font-semibold font-mono text-foreground">
              {scan.testedRoutes} / {scan.totalRoutes} pages
            </span>
          </div>
        </div>
      </div>

      {scan.regressions && scan.regressions.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-rose-400 flex items-center gap-2">
              <Flame className="w-5 h-5 shrink-0" />
              Deployment Regressions Detected ({scan.regressions.length})
            </CardTitle>
            <CardDescription className="text-xs text-rose-300/80">
              The following routes broke or degraded compared to the previous deployment scan:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {scan.regressions.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between text-xs font-mono bg-background/50 border border-rose-900/40 p-2.5 rounded-lg"
              >
                <div className="flex items-center gap-2 truncate">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold text-foreground truncate">{reg.path}</span>
                  <span className="text-muted-foreground">— {reg.details?.evidence}</span>
                </div>
                <Badge variant="failed">{reg.changeType.replace("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Healthy Routes</CardDescription>
            <CardTitle className="text-2xl font-mono text-emerald-400">{scan.healthyRoutes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Failed Routes</CardDescription>
            <CardTitle className="text-2xl font-mono text-rose-400">{scan.failedRoutes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Console Errors</CardDescription>
            <CardTitle className="text-2xl font-mono text-amber-400">
              {scan.summary?.consoleErrors ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Broken Assets / 5xx</CardDescription>
            <CardTitle className="text-2xl font-mono text-cyan-400">
              {(scan.summary?.failedRequests ?? 0) + (scan.summary?.brokenAssets ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Route Explorer</h2>
            <span className="text-xs font-mono text-muted-foreground">({filteredRoutes.length} routes)</span>
          </div>

          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({routes.length})
            </button>
            <button
              onClick={() => setFilter("failed")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === "failed" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Failed ({scan.failedRoutes})
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === "warning" ? "bg-amber-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Warnings ({scan.warningRoutes})
            </button>
            <button
              onClick={() => setFilter("healthy")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === "healthy" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Healthy ({scan.healthyRoutes})
            </button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3">Route Path</TableHead>
              <TableHead className="px-4 py-3">HTTP Status</TableHead>
              <TableHead className="px-4 py-3">Health</TableHead>
              <TableHead className="px-4 py-3">Rendering</TableHead>
              <TableHead className="px-4 py-3">Load Time</TableHead>
              <TableHead className="px-4 py-3">Issues</TableHead>
              <TableHead className="px-5 py-3 text-right">Inspect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.map((route) => (
              <TableRow
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="cursor-pointer"
              >
                <TableCell className="px-5 py-3.5 font-mono font-medium text-foreground truncate max-w-sm">
                  {route.path}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-xs">
                  {route.httpStatus ? (
                    <span
                      className={
                        route.httpStatus < 400
                          ? "text-emerald-400 font-semibold"
                          : "text-rose-400 font-semibold"
                      }
                    >
                      {route.httpStatus}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Badge
                    variant={
                      route.healthStatus === "healthy"
                        ? "healthy"
                        : route.healthStatus === "warning"
                          ? "warning"
                          : "failed"
                    }
                    dot
                  >
                    {route.healthStatus.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-xs text-muted-foreground uppercase">
                  {route.renderingType || "unknown"}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                  {route.loadTimeMs ? `${route.loadTimeMs}ms` : "—"}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-xs font-mono">
                  {route.healthReasons && route.healthReasons.length > 0 ? (
                    <span className="text-rose-400 truncate block max-w-xs">
                      {route.healthReasons[0]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet
        isOpen={Boolean(selectedRoute)}
        onClose={() => setSelectedRoute(null)}
        title={selectedRoute?.path}
        description={`Tested in Playwright Chromium • Status ${selectedRoute?.httpStatus || 200}`}
      >
        {isDetailLoading || !pageDetail ? (
          <div className="space-y-4 pt-2">
            <Skeleton className="h-60 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none p-0 bg-transparent">
              <TabsTrigger value="overview">Overview & Screenshot</TabsTrigger>
              <TabsTrigger value="console">
                Console ({pageDetail.consoleEvents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="network">
                Network ({pageDetail.networkRequests?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="runtime">
                Runtime Errors ({pageDetail.runtimeErrors?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase">Load Duration</span>
                  <span className="font-semibold text-foreground text-sm">{pageDetail.loadTimeMs}ms</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase">Rendering Mode</span>
                  <span className="font-semibold text-foreground text-sm uppercase">{pageDetail.renderingType}</span>
                </div>
              </div>

              {pageDetail.healthReasons && pageDetail.healthReasons.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
                  <span className="font-semibold block mb-1">Detected Issues:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {pageDetail.healthReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-2">
                  Headless Browser Screenshot
                </span>
                {pageDetail.screenshotUrl ? (
                  <div className="rounded-lg border border-border overflow-hidden bg-zinc-950">
                    <img
                      src={getMediaUrl(pageDetail.screenshotUrl)}
                      alt={`Screenshot of ${pageDetail.path}`}
                      className="w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    Screenshot not captured for this route
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="console" className="space-y-3 pt-4">
              {pageDetail.consoleEvents && pageDetail.consoleEvents.length > 0 ? (
                pageDetail.consoleEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-lg border font-mono text-xs ${
                      ev.type === "error"
                        ? "bg-rose-950/20 border-rose-900/40 text-rose-300"
                        : ev.type === "warn"
                          ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                          : "bg-secondary/40 border-border text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-bold uppercase text-[10px]">{ev.type}</span>
                      {ev.location && <span className="text-muted-foreground text-[10px]">{ev.location}</span>}
                    </div>
                    <p className="whitespace-pre-wrap break-all">{ev.message}</p>
                    {ev.stack && (
                      <pre className="text-[10px] text-muted-foreground mt-2 overflow-x-auto p-2 bg-black/40 rounded">
                        {ev.stack}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  Clean console. Zero errors or warnings detected.
                </div>
              )}
            </TabsContent>

            <TabsContent value="network" className="space-y-2 pt-4">
              {pageDetail.networkRequests && pageDetail.networkRequests.length > 0 ? (
                pageDetail.networkRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono ${
                      req.failed ? "bg-rose-950/20 border-rose-900/40" : "bg-secondary/30 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate max-w-md">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{req.method}</span>
                      <span className="truncate text-foreground">{req.url}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-muted-foreground text-[11px]">{req.durationMs}ms</span>
                      <span
                        className={`font-semibold ${
                          req.failed ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {req.status || "FAIL"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  No network requests captured
                </div>
              )}
            </TabsContent>

            <TabsContent value="runtime" className="space-y-3 pt-4">
              {pageDetail.runtimeErrors && pageDetail.runtimeErrors.length > 0 ? (
                pageDetail.runtimeErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase">{err.errorType} Error</span>
                      {err.source && <span className="text-[10px] text-muted-foreground">{err.source}</span>}
                    </div>
                    <p className="font-semibold">{err.message}</p>
                    {err.stack && (
                      <pre className="text-[10px] text-rose-200/70 overflow-x-auto p-2.5 bg-black/60 rounded">
                        {err.stack}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  Zero uncaught exceptions or hydration mismatches.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </Sheet>
    </div>
  );
}
