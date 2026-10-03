"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
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
  Layers,
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
  DataTable,
  type ColumnDef,
} from "@repo/ui";
import { useScans, useTriggerScan, type ScanDetail } from "@/react-query/scans/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const quickScanFormSchema = z.object({
  quickUrl: z.string().url("Must be a valid URL (e.g. https://example.com)")
});

type QuickScanFormValues = z.infer<typeof quickScanFormSchema>;

export function DashboardOverview() {
  const router = useRouter();

  // URL query state synced with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5)
  );

  const { data: scansResponse, isLoading } = useScans({ page, pageSize });
  const triggerScan = useTriggerScan();

  const {
    register,
    handleSubmit: handleQuickScanSubmit,
    reset: resetQuickScan,
    formState: { errors: quickScanErrors }
  } = useForm<QuickScanFormValues>({
    resolver: zodResolver(quickScanFormSchema),
    defaultValues: {
      quickUrl: ""
    }
  });

  const onQuickScan = async (data: QuickScanFormValues) => {
    try {
      const res = await triggerScan.mutateAsync({ targetUrl: data.quickUrl.trim() });
      resetQuickScan();
      if (res && res.id) {
        router.push(`/dashboard/scans/${res.id}`);
      }
    } catch {
    }
  };

  const scans = scansResponse?.items || [];
  const totalScans = scansResponse?.totalCount || 0;
  const totalPages = scansResponse?.totalPages || 1;
  const completedScans = scans.filter((s) => s.status === "completed");
  const averageHealth =
    completedScans.length > 0
      ? Math.round(
          completedScans.reduce((acc, s) => acc + (s.healthScore || 0), 0) /
            completedScans.length
        )
      : 100;

  const totalRoutesTested = completedScans.reduce(
    (acc, s) => acc + (s.testedRoutes || 0),
    0
  );
  const totalFailedIssues = completedScans.reduce(
    (acc, s) => acc + (s.failedRoutes || 0),
    0
  );

  const columns: ColumnDef<ScanDetail>[] = React.useMemo(
    () => [
      {
        id: "targetUrl",
        header: "Target Application",
        className: "px-5 py-4",
        headerClassName: "px-5 py-3",
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground truncate max-w-xs">
                {row.targetUrl}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {new Date(row.createdAt).toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        className: "px-4 py-4",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => {
          const isCompleted = row.status === "completed";
          const isScanning =
            row.status === "scanning" || row.status === "discovering";
          const isFailed = row.status === "failed";
          const isCancelled = row.status === "cancelled";

          return (
            <>
              {isCompleted && (
                <Badge variant="healthy">
                  Completed
                </Badge>
              )}
              {isScanning && (
                <Badge variant="info">
                  {row.status.toUpperCase()}
                </Badge>
              )}
              {row.status === "queued" && (
                <Badge variant="neutral">Queued</Badge>
              )}
              {isFailed && <Badge variant="failed">Failed</Badge>}
              {isCancelled && <Badge variant="warning">Cancelled</Badge>}
            </>
          );
        },
      },
      {
        id: "healthScore",
        header: "Health Score",
        className: "px-4 py-4 font-semibold",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => {
          if (row.status !== "completed") {
            return <span className="text-muted-foreground">—</span>;
          }
          const score = row.healthScore ?? 0;
          const color =
            score >= 90
              ? "text-success"
              : score >= 70
                ? "text-warning"
                : "text-destructive";
          return <span className={color}>{score}%</span>;
        },
      },
      {
        id: "routes",
        header: "Discovered / Tested",
        className: "px-4 py-4 text-xs text-muted-foreground",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => `${row.testedRoutes} / ${row.totalRoutes} routes`,
      },
      {
        id: "failures",
        header: "Failures",
        className: "px-4 py-4",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => {
          if (row.failedRoutes > 0) {
            return (
              <span className="inline-flex items-center gap-1 text-xs text-destructive font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                {row.failedRoutes} failed
              </span>
            );
          }
          if (row.warningRoutes > 0) {
            return (
              <span className="inline-flex items-center gap-1 text-xs text-warning">
                <AlertTriangle className="w-3.5 h-3.5" />
                {row.warningRoutes} warnings
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Clean
            </span>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        align: "right",
        className: "px-5 py-4 text-right",
        headerClassName: "px-5 py-3 text-right",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/scans/${row.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Inspect
            </Button>
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          QA Intelligence Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automated real-browser testing, route health analysis, and deployment
          regression monitoring.
        </p>
      </div>

      <Card className="border-primary/20 bg-linear-to-r from-card via-card to-primary/5">
        <CardContent className="pt-6">
          <form
            onSubmit={handleQuickScanSubmit(onQuickScan)}
            className="flex flex-col md:flex-row gap-3 items-start"
          >
            <div className="flex-1 w-full">
              <Input
                placeholder="https://your-production-app.com"
                leftIcon={<Globe className="w-4 h-4" />}
                error={quickScanErrors.quickUrl?.message}
                {...register("quickUrl")}
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
              <Activity className="w-4 h-4 text-success" />
            </CardDescription>
            <CardTitle className="text-3xl text-success">
              {averageHealth}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Based on {completedScans.length} completed scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Total Scans</span>
              <Layers className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-3xl">{totalScans}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Production & staging runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Routes Tested</span>
              <FileCode2 className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-3xl">
              {totalRoutesTested}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Discovered and inspected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Failed Pages</span>
              <XCircle className="w-4 h-4 text-destructive" />
            </CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {totalFailedIssues}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Hydration, 5xx, or JS errors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Scan Activity
          </h2>
          <span className="text-xs text-muted-foreground">
            Live feed (auto-refreshing)
          </span>
        </div>

        <DataTable
          columns={columns}
          data={scans}
          isLoading={isLoading && !scansResponse}
          loadingRowCount={4}
          pagination={true}
          manualPagination={true}
          page={page - 1}
          pageSize={pageSize}
          totalCount={totalScans}
          pageCount={totalPages}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={(zeroBased) => setPage(zeroBased + 1)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onRowClick={(scan) => router.push(`/dashboard/scans/${scan.id}`)}
          emptyState={
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">
                No scans found
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Enter your application URL above to launch your first automated
                real-browser QA scan.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
