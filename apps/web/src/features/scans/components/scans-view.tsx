"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { Globe, ArrowRight, ShieldCheck, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button, Badge, DataTable, type ColumnDef } from "@repo/ui";
import { cn } from "@repo/ui";
import { useScans, type ScanDetail } from "@/react-query/scans/actions";

export function ScansView() {
  const router = useRouter();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const { data: scansResponse, isLoading } = useScans({ page, pageSize });

  const scans = scansResponse?.items || [];
  const totalCount = scansResponse?.totalCount || 0;
  const totalPages = scansResponse?.totalPages || 1;

  const columns: ColumnDef<ScanDetail>[] = useMemo(
    () => [
      {
        id: "targetUrl",
        header: "Target Application",
        className: "px-5 py-4",
        headerClassName: "px-5 py-3",
        cell: ({ row }) => (
          <div>
            <div className='flex items-center gap-2'>
              <Globe className='w-4 h-4 text-muted-foreground shrink-0' />
              <span className='font-medium text-foreground truncate max-w-sm'>{row.targetUrl}</span>
            </div>
            <span className='text-[11px] text-muted-foreground block mt-0.5'>{new Date(row.createdAt).toLocaleString()}</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.status === "completed" ? "healthy" : row.status === "failed" ? "failed" : row.status === "cancelled" ? "warning" : "info"
            }
          >
            {row.status.toUpperCase()}
          </Badge>
        ),
      },
      {
        id: "healthScore",
        header: "Health Score",
        cell: ({ row }) => {
          if (row.status !== "completed") {
            return <span className='text-muted-foreground'>—</span>;
          }
          const score = row.healthScore ?? 0;
          const scoreColor = score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive";
          return <span className={cn("font-semibold", scoreColor)}>{score}%</span>;
        },
      },
      {
        id: "routesTested",
        header: "Routes Tested",
        className: "text-xs text-muted-foreground",
        cell: ({ row }) => `${row.testedRoutes} / ${row.totalRoutes}`,
      },
      {
        id: "failures",
        header: "Failures",
        cell: ({ row }) => {
          if (row.failedRoutes > 0) {
            return (
              <span className='inline-flex items-center gap-1 text-xs text-destructive font-semibold'>
                <XCircle className='w-3.5 h-3.5' />
                {row.failedRoutes} failed
              </span>
            );
          }
          if (row.warningRoutes > 0) {
            return (
              <span className='inline-flex items-center gap-1 text-xs text-warning'>
                <AlertTriangle className='w-3.5 h-3.5' />
                {row.warningRoutes} warnings
              </span>
            );
          }
          return (
            <span className='inline-flex items-center gap-1 text-xs text-success'>
              <CheckCircle2 className='w-3.5 h-3.5' />
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
          <Link href={`/dashboard/scans/${row.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size='sm' variant='outline' rightIcon={<ArrowRight className='w-3.5 h-3.5' />}>
              View Report
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>QA Scan History</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Review automated real-browser test results, regression signals, and route coverage.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={scans}
        isLoading={isLoading && !scansResponse}
        loadingRowCount={5}
        pagination={true}
        manualPagination={true}
        page={page - 1}
        pageSize={pageSize}
        totalCount={totalCount}
        pageCount={totalPages}
        pageSizeOptions={[5, 10, 20, 50]}
        onPageChange={(zeroBasedPage) => setPage(zeroBasedPage + 1)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onRowClick={(row) => router.push(`/dashboard/scans/${row.id}`)}
        emptyState={
          <div className='flex flex-col items-center justify-center py-12 text-center space-y-3'>
            <ShieldCheck className='w-12 h-12 text-muted-foreground mx-auto' />
            <h3 className='text-base font-semibold text-foreground'>No scans found</h3>
            <p className='text-sm text-muted-foreground max-w-sm mx-auto'>
              You haven't run any browser scans yet. Start one from the Overview page.
            </p>
            <div className='pt-2'>
              <Link href='/dashboard'>
                <Button size='sm' variant='primary'>
                  Go to Overview
                </Button>
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}
