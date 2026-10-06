"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { DataTable, Button, Badge, type ColumnDef } from "@repo/ui";
import type { ScanDetail } from "@/react-query/scans/actions";

interface RecentScansTableProps {
  scans: ScanDetail[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function RecentScansTable({
  scans,
  isLoading,
  page,
  pageSize,
  totalCount,
  pageCount,
  onPageChange,
  onPageSizeChange,
}: RecentScansTableProps) {
  const router = useRouter();

  const columns: ColumnDef<ScanDetail>[] = useMemo(
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
              {isCompleted && <Badge variant="healthy">Completed</Badge>}
              {isScanning && <Badge variant="info">{row.status.toUpperCase()}</Badge>}
              {row.status === "queued" && <Badge variant="neutral">Queued</Badge>}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Scan Activity</h2>
        <span className="text-xs text-muted-foreground">Live feed (auto-refreshing)</span>
      </div>

      <DataTable
        columns={columns}
        data={scans}
        isLoading={isLoading}
        loadingRowCount={4}
        pagination={true}
        manualPagination={true}
        page={page - 1}
        pageSize={pageSize}
        totalCount={totalCount}
        pageCount={pageCount}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={(zeroBased) => onPageChange(zeroBased + 1)}
        onPageSizeChange={onPageSizeChange}
        onRowClick={(scan) => router.push(`/dashboard/scans/${scan.id}`)}
        emptyState={
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-foreground">No scans found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Enter your application URL above to launch your first automated real-browser QA scan.
            </p>
          </div>
        }
      />
    </div>
  );
}
