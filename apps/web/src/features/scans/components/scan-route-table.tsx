"use client";

import React, { useMemo } from "react";
import { Badge, Button, DataTable, type ColumnDef } from "@repo/ui";
import type { ScanRoute } from "@/react-query/scans/actions";

interface ScanRouteTableProps {
  routes: ScanRoute[];
  totalRoutes: number;
  failedRoutes: number;
  warningRoutes: number;
  healthyRoutes: number;
  filter: "all" | "failed" | "warning" | "healthy";
  onFilterChange: (filter: "all" | "failed" | "warning" | "healthy") => void;
  onSelectRoute: (route: ScanRoute) => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  pageCount?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function ScanRouteTable({
  routes,
  totalRoutes,
  failedRoutes,
  warningRoutes,
  healthyRoutes,
  filter,
  onFilterChange,
  onSelectRoute,
  page,
  pageSize,
  totalCount,
  pageCount,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: ScanRouteTableProps) {
  const columns: ColumnDef<ScanRoute>[] = useMemo(
    () => [
      {
        id: "path",
        header: "Route Path",
        className: "px-5 py-3.5 font-medium text-foreground truncate max-w-sm",
        headerClassName: "px-5 py-3",
        cell: ({ row }) => row.path,
      },
      {
        id: "httpStatus",
        header: "HTTP Status",
        className: "px-4 py-3.5 text-xs",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => {
          if (!row.httpStatus) {
            return <span className='text-muted-foreground'>—</span>;
          }
          return (
            <span className={row.httpStatus < 400 ? "text-success font-semibold" : "text-destructive font-semibold"}>{row.httpStatus}</span>
          );
        },
      },
      {
        id: "health",
        header: "Health",
        className: "px-4 py-3.5",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => (
          <Badge variant={row.healthStatus === "healthy" ? "healthy" : row.healthStatus === "warning" ? "warning" : "failed"}>
            {row.healthStatus.toUpperCase()}
          </Badge>
        ),
      },
      {
        id: "rendering",
        header: "Rendering",
        className: "px-4 py-3.5 text-xs text-muted-foreground uppercase",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => row.renderingType || "unknown",
      },
      {
        id: "loadTime",
        header: "Load Time",
        className: "px-4 py-3.5 text-xs text-muted-foreground",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => (row.loadTimeMs ? `${row.loadTimeMs}ms` : "—"),
      },
      {
        id: "issues",
        header: "Issues",
        className: "px-4 py-3.5 text-xs",
        headerClassName: "px-4 py-3",
        cell: ({ row }) => {
          if (row.healthReasons && row.healthReasons.length > 0) {
            return <span className='text-destructive truncate block max-w-xs'>{row.healthReasons[0]}</span>;
          }
          return <span className='text-muted-foreground'>None</span>;
        },
      },
      {
        id: "inspect",
        header: "Inspect",
        align: "right",
        className: "px-5 py-3.5 text-right",
        headerClassName: "px-5 py-3 text-right",
        cell: ({ row }) => (
          <Button
            size='sm'
            variant='outline'
            onClick={(e) => {
              e.stopPropagation();
              onSelectRoute(row);
            }}
          >
            View Details
          </Button>
        ),
      },
    ],
    [onSelectRoute],
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold text-foreground'>Route Explorer</h2>
          <span className='text-xs text-muted-foreground'>({totalCount ?? routes.length} routes)</span>
        </div>

        <div className='flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border text-xs'>
          <Button
            type='button'
            size='sm'
            variant={filter === "all" ? "primary" : "ghost"}
            onClick={() => onFilterChange("all")}
            className='h-7 px-2.5 text-xs font-medium'
          >
            All ({totalRoutes})
          </Button>
          <Button
            type='button'
            size='sm'
            variant={filter === "failed" ? "destructive" : "ghost"}
            onClick={() => onFilterChange("failed")}
            className='h-7 px-2.5 text-xs font-medium'
          >
            Failed ({failedRoutes})
          </Button>
          <Button
            type='button'
            size='sm'
            variant={filter === "warning" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("warning")}
            className={`h-7 px-2.5 text-xs font-medium ${filter === "warning" ? "bg-warning text-black font-semibold" : ""}`}
          >
            Warnings ({warningRoutes})
          </Button>
          <Button
            type='button'
            size='sm'
            variant={filter === "healthy" ? "secondary" : "ghost"}
            onClick={() => onFilterChange("healthy")}
            className={`h-7 px-2.5 text-xs font-medium ${filter === "healthy" ? "bg-success text-white font-semibold" : ""}`}
          >
            Healthy ({healthyRoutes})
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={routes}
        isLoading={isLoading}
        pagination={true}
        manualPagination={page !== undefined}
        page={page !== undefined ? page - 1 : undefined}
        pageSize={pageSize ?? 10}
        totalCount={totalCount}
        pageCount={pageCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={(zeroBased) => onPageChange?.(zeroBased + 1)}
        onPageSizeChange={(newSize) => onPageSizeChange?.(newSize)}
        onRowClick={(route) => onSelectRoute(route)}
        emptyMessage='No routes match the selected filter'
      />
    </div>
  );
}
