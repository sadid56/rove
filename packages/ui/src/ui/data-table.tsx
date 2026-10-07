"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";
import { cn } from "../utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "./dropdown";

export interface ColumnDef<TData> {
  id?: string;
  header:
    | React.ReactNode
    | ((props: { column: ColumnDef<TData> }) => React.ReactNode);
  accessorKey?: keyof TData;
  cell?: (props: {
    row: TData;
    index: number;
    value: any;
  }) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalItems: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPaginationInfo?: boolean;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true,
  showPaginationInfo = true,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  const visiblePages = useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const current = pageIndex + 1;
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", pageCount] as const;
    }
    if (current >= pageCount - 3) {
      return [
        1,
        "ellipsis",
        pageCount - 4,
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ] as const;
    }
    return [
      1,
      "ellipsis",
      current - 1,
      current,
      current + 1,
      "ellipsis",
      pageCount,
    ] as const;
  }, [pageIndex, pageCount]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-border">
      {/* Left side: Item info & Page size selector */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
        {showPaginationInfo && (
          <span>
            Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
            <span className="font-semibold text-foreground">{endItem}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> results
          </span>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <Dropdown>
              <DropdownTrigger className="h-8 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 hover:bg-secondary transition-colors gap-1.5 cursor-pointer">
                {({ isOpen }) => (
                  <>
                    <span>{pageSize}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </>
                )}
              </DropdownTrigger>
              <DropdownMenu align="left" side="top" className="min-w-[5.5rem] p-1">
                {pageSizeOptions.map((size) => (
                  <DropdownItem
                    key={size}
                    onClick={() => onPageSizeChange(size)}
                    rightIcon={
                      pageSize === size ? (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : null
                    }
                    className={cn(
                      "text-xs py-1.5 px-2.5",
                      pageSize === size && "font-semibold text-foreground bg-accent/60"
                    )}
                  >
                    {size}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(0)}
          disabled={!canPreviousPage}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-xs text-muted-foreground select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = pageIndex === page - 1;
            return (
              <Button
                key={page}
                variant={isCurrent ? "primary" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 text-xs font-medium",
                  isCurrent && "pointer-events-none"
                )}
                onClick={() => onPageChange(page - 1)}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageCount - 1)}
          disabled={!canNextPage}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyState?: React.ReactNode;
  emptyMessage?: string;
  // Pagination
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPaginationInfo?: boolean;
  // Controlled pagination
  manualPagination?: boolean;
  page?: number;
  pageSize?: number;
  pageCount?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Row interaction & styling
  onRowClick?: (row: TData, index: number) => void;
  rowClassName?: string | ((row: TData, index: number) => string);
  keyExtractor?: (row: TData, index: number) => string | number;
  className?: string;
  tableClassName?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  loadingRowCount = 5,
  emptyState,
  emptyMessage = "No data found",
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true,
  showPaginationInfo = true,
  manualPagination = false,
  page: controlledPage,
  pageSize: controlledPageSize,
  pageCount: controlledPageCount,
  totalCount: controlledTotalCount,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  onRowClick,
  rowClassName,
  keyExtractor,
  className,
  tableClassName,
}: DataTableProps<TData>) {
  // Uncontrolled pagination state
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const pageIndex = manualPagination ? (controlledPage ?? 0) : internalPageIndex;
  const pageSize = manualPagination ? (controlledPageSize ?? defaultPageSize) : internalPageSize;

  const totalItems = manualPagination
    ? (controlledTotalCount ?? data.length)
    : data.length;

  const pageCount = manualPagination
    ? (controlledPageCount ?? Math.max(1, Math.ceil(totalItems / pageSize)))
    : Math.max(1, Math.ceil(totalItems / pageSize));

  const handlePageChange = (newPage: number) => {
    if (manualPagination) {
      controlledOnPageChange?.(newPage);
    } else {
      setInternalPageIndex(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (manualPagination) {
      controlledOnPageSizeChange?.(newPageSize);
    } else {
      setInternalPageSize(newPageSize);
      setInternalPageIndex(0);
    }
  };

  // Sliced data for client-side pagination
  const paginatedData = useMemo(() => {
    if (manualPagination || !pagination) {
      return data;
    }
    const start = pageIndex * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, manualPagination, pagination, pageIndex, pageSize]);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className={cn("space-y-3 w-full", className)}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={col.id || String(col.accessorKey) || `col-${idx}`}
                className={cn(
                  getAlignmentClass(col.align),
                  col.headerClassName
                )}
              >
                {typeof col.header === "function"
                  ? col.header({ column: col })
                  : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: loadingRowCount }).map((_, rIdx) => (
              <TableRow key={`skeleton-row-${rIdx}`}>
                {columns.map((col, cIdx) => (
                  <TableCell
                    key={`skeleton-cell-${cIdx}`}
                    className={cn(getAlignmentClass(col.align), col.className)}
                  >
                    <Skeleton className="h-4 w-full max-w-[80%]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-44 text-center"
              >
                {emptyState ?? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground border border-border">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No records to display at this time.
                    </p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, rowIdx) => {
              const actualIndex = pagination && !manualPagination
                ? pageIndex * pageSize + rowIdx
                : rowIdx;

              const rowKey = keyExtractor
                ? keyExtractor(row, actualIndex)
                : ((row as any)?.id ?? actualIndex);

              const resolvedRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(row, actualIndex)
                  : rowClassName;

              return (
                <TableRow
                  key={rowKey}
                  onClick={() => onRowClick?.(row, actualIndex)}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    resolvedRowClass
                  )}
                >
                  {columns.map((col, colIdx) => {
                    const cellValue = col.accessorKey
                      ? (row as any)[col.accessorKey]
                      : undefined;

                    return (
                      <TableCell
                        key={
                          col.id ||
                          String(col.accessorKey) ||
                          `cell-${colIdx}`
                        }
                        className={cn(
                          getAlignmentClass(col.align),
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell({
                              row,
                              index: actualIndex,
                              value: cellValue,
                            })
                          : (cellValue as React.ReactNode)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && !isLoading && data.length > 0 && (
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          totalItems={totalItems}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          showPageSizeSelector={showPageSizeSelector}
          showPaginationInfo={showPaginationInfo}
        />
      )}
    </div>
  );
}
