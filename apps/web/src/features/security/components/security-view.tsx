"use client";

import React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  AlertTriangle,
  Play,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  DataTable,
  type ColumnDef,
} from "@repo/ui";
import {
  useSecurityFindings,
  useRunSecurityScan,
  type SecurityFindingItem,
} from "@/react-query/qa-suites/actions";
import { PageHeader, StateCard } from "@/components/common";

export function SecurityView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const { data: findingsResponse, isLoading } = useSecurityFindings({ page, pageSize });
  const runScanMutation = useRunSecurityScan();

  const findings = findingsResponse?.items || [];
  const totalCount = findingsResponse?.totalCount || 0;
  const totalPages = findingsResponse?.totalPages || 1;
  const stats = findingsResponse?.stats;

  const handleScan = async () => {
    await runScanMutation.mutateAsync({});
  };

  const criticalCount = stats?.criticalCount ?? findings.filter((f) => f.severity === "critical").length;
  const warningCount = stats?.warningCount ?? findings.filter((f) => f.severity === "warning").length;

  const columns: ColumnDef<SecurityFindingItem>[] = [
    {
      header: "Category",
      accessorKey: "category",
      cell: ({ value }) => (
        <span className="font-semibold text-xs text-foreground">{value}</span>
      ),
    },
    {
      header: "Finding Description",
      accessorKey: "title",
      cell: ({ value }) => (
        <span className="text-xs font-medium text-foreground max-w-sm block">{value}</span>
      ),
    },
    {
      header: "Target Location",
      accessorKey: "location",
      cell: ({ value }) => (
        <span className="font-mono text-[11px] text-muted-foreground truncate max-w-xs block">
          {value}
        </span>
      ),
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: ({ value }) => (
        <Badge
          variant={
            value === "passed"
              ? "healthy"
              : value === "critical"
              ? "failed"
              : value === "warning"
              ? "warning"
              : "info"
          }
          className="uppercase text-[10px]"
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Action & Fix",
      accessorKey: "recommendation",
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground max-w-md block">{value}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Secret Leak Sentinel"
        description="Automated scanning for exposed API credentials, PII data leaks, and OWASP web vulnerability compliance."
        icon={<ShieldCheck className="w-6 h-6 text-primary" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            isLoading={runScanMutation.isPending}
            onClick={handleScan}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Run Security Scan
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StateCard
          label="Active Policy"
          value="OWASP Top 10"
          description="Strict security ruleset active"
          icon={<Lock className="w-4 h-4 text-primary" />}
        />

        <StateCard
          label="Critical Leaks"
          value={criticalCount}
          description="High severity secrets or PII"
          icon={<ShieldAlert className="w-4 h-4 text-destructive" />}
          valueClass={criticalCount > 0 ? "text-destructive" : "text-foreground"}
        />

        <StateCard
          label="Header Warnings"
          value={warningCount}
          description="Missing CSP, HSTS, or frame defense"
          icon={<AlertTriangle className="w-4 h-4 text-warning" />}
          valueClass={warningCount > 0 ? "text-warning" : "text-foreground"}
        />

        <StateCard
          label="Secret Leak Status"
          value="Clean"
          description="Static bundle tokens verified"
          icon={<Key className="w-4 h-4 text-success" />}
          valueClass="text-success"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Security Findings & Directives</CardTitle>
          <CardDescription className="text-xs">
            Evaluated on all client bundles, network headers, and API telemetry logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={findings}
            isLoading={isLoading && !findingsResponse}
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
            emptyMessage="No security findings reported."
          />
        </CardContent>
      </Card>
    </div>
  );
}
