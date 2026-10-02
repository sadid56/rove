"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Play,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  FileCode2,
  Layers
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton
} from "@repo/ui";
import { useScans, useTriggerScan } from "@/react-query/scans/actions";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [quickUrl, setQuickUrl] = useState("");
  const { data: scans, isLoading } = useScans();
  const triggerScan = useTriggerScan();

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    try {
      const res = await triggerScan.mutateAsync({ targetUrl: quickUrl.trim() });
      setQuickUrl("");
      if (res && res.id) {
        router.push(`/dashboard/scans/${res.id}`);
      }
    } catch {
      // handled
    }
  };

  const totalScans = scans?.length || 0;
  const completedScans = scans?.filter((s) => s.status === "completed") || [];
  const averageHealth =
    completedScans.length > 0
      ? Math.round(
          completedScans.reduce((acc, s) => acc + (s.healthScore || 0), 0) / completedScans.length
        )
      : 100;

  const totalRoutesTested = completedScans.reduce((acc, s) => acc + (s.testedRoutes || 0), 0);
  const totalFailedIssues = completedScans.reduce((acc, s) => acc + (s.failedRoutes || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">QA Intelligence Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated real-browser testing, route health analysis, and deployment regression monitoring.
        </p>
      </div>

      <Card className="border-primary/20 bg-linear-to-r from-card via-card to-primary/5">
        <CardContent className="pt-6">
          <form onSubmit={handleQuickScan} className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <Input
                placeholder="https://your-production-app.com"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={triggerScan.isPending}
              leftIcon={<Play className="w-4 h-4" />}
              className="shrink-0"
            >
              Run Instant Scan
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Overall Health</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-emerald-400">{averageHealth}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Based on {completedScans.length} completed scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Scans</span>
              <Layers className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono">{totalScans}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Production & staging runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Routes Tested</span>
              <FileCode2 className="w-4 h-4 text-cyan-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono">{totalRoutesTested}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Discovered and inspected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Failed Pages</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-rose-400">{totalFailedIssues}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Hydration, 5xx, or JS errors</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Scan Activity</h2>
          <span className="text-xs text-muted-foreground font-mono">Live feed (auto-refreshing)</span>
        </div>

        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 py-3">Target Application</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Discovered / Tested</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead className="px-5 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-5 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <Skeleton className="h-8 w-24 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !scans || scans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">No scans found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Enter your application URL above to launch your first automated real-browser QA scan.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5 py-3">Target Application</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Discovered / Tested</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead className="px-5 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => {
                    const isCompleted = scan.status === "completed";
                    const isScanning = scan.status === "scanning" || scan.status === "discovering";
                    const isFailed = scan.status === "failed";
                    const isCancelled = scan.status === "cancelled";

                    return (
                      <TableRow key={scan.id}>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-mono font-medium text-foreground truncate max-w-xs">
                              {scan.targetUrl}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                            {new Date(scan.createdAt).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {isCompleted && (
                            <Badge variant="healthy" dot>
                              Completed
                            </Badge>
                          )}
                          {isScanning && (
                            <Badge variant="info" dot>
                              {scan.status.toUpperCase()}
                            </Badge>
                          )}
                          {scan.status === "queued" && <Badge variant="neutral">Queued</Badge>}
                          {isFailed && <Badge variant="failed">Failed</Badge>}
                          {isCancelled && <Badge variant="warning">Cancelled</Badge>}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-mono font-semibold">
                          {isCompleted ? (
                            <span
                              className={
                                (scan.healthScore || 0) >= 90
                                  ? "text-emerald-400"
                                  : (scan.healthScore || 0) >= 70
                                    ? "text-amber-400"
                                    : "text-rose-400"
                              }
                            >
                              {scan.healthScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4 font-mono text-xs text-muted-foreground">
                          {scan.testedRoutes} / {scan.totalRoutes} routes
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {scan.failedRoutes > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-400 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              {scan.failedRoutes} failed
                            </span>
                          ) : scan.warningRoutes > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {scan.warningRoutes} warnings
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Clean
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <Link href={`/dashboard/scans/${scan.id}`}>
                            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                              Inspect
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
      </div>
    </div>
  );
}
