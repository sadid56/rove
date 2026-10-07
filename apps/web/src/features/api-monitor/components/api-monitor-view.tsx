"use client";

import React, { useState, useMemo } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import {
  Activity,
  Server,
  Play,
  CheckCircle2,
  Clock,
  Plus,
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
  Modal,
  Input,
  Select,
} from "@repo/ui";
import {
  useApiMonitors,
  useCreateApiMonitor,
  usePingApiMonitor,
  type ApiMonitorItem,
} from "@/react-query/qa-suites/actions";
import { PageHeader, StateCard } from "@/components/common";

export function ApiMonitorView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const { data: monitorsResponse, isLoading } = useApiMonitors({ page, pageSize });
  const createMonitor = useCreateApiMonitor();
  const pingMonitor = usePingApiMonitor();

  const endpoints = monitorsResponse?.items || [];
  const totalCount = monitorsResponse?.totalCount || 0;
  const totalPages = monitorsResponse?.totalPages || 1;
  const stats = monitorsResponse?.stats;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newMethod, setNewMethod] = useState<"GET" | "POST">("GET");

  const handlePing = async (id: string) => {
    await pingMonitor.mutateAsync({ id });
  };

  const handleAddEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    await createMonitor.mutateAsync({
      name: newName.trim() || newUrl.trim(),
      method: newMethod,
      url: newUrl.trim(),
    });

    setNewName("");
    setNewUrl("");
    setIsModalOpen(false);
  };

  const totalEndpoints = stats?.total ?? totalCount;
  const healthyCount = stats?.healthy ?? endpoints.filter((e) => e.status < 400).length;
  const avgLatency =
    stats?.avgLatency ??
    (endpoints.length > 0
      ? Math.round(endpoints.reduce((acc, curr) => acc + curr.latencyMs, 0) / endpoints.length)
      : 0);

  const columns: ColumnDef<ApiMonitorItem>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Method & Service",
        className: "px-5 py-4",
        headerClassName: "px-5 py-3",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary text-foreground">
              {row.method}
            </span>
            <span className="font-medium text-xs text-foreground">{row.name}</span>
          </div>
        ),
      },
      {
        id: "url",
        header: "Path",
        className: "font-mono text-xs text-muted-foreground truncate max-w-xs",
        cell: ({ row }) => row.url,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.status < 400 ? "healthy" : "failed"}>
            {row.status} {row.status < 400 ? "OK" : "ERROR"}
          </Badge>
        ),
      },
      {
        id: "latency",
        header: "Latency",
        className: "text-xs text-foreground font-medium",
        cell: ({ row }) => `${row.latencyMs}ms`,
      },
      {
        id: "uptime",
        header: "Uptime",
        className: "text-xs text-foreground",
        cell: ({ row }) => (
          <span className={row.uptimePercent >= 99 ? "text-success" : "text-warning"}>
            {row.uptimePercent}%
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        className: "text-right px-5 py-4",
        headerClassName: "text-right px-5 py-3",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            isLoading={pingMonitor.isPending}
            onClick={() => handlePing(row.id)}
            leftIcon={<Play className="w-3 h-3" />}
          >
            Ping Now
          </Button>
        ),
      },
    ],
    [pingMonitor.isPending]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & Endpoint Health Monitor"
        description="Real-time ping latency, TTFB tracking, and SLA status for critical frontend endpoints."
        icon={<Activity className="w-6 h-6 text-primary" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Endpoint
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StateCard
          label="Monitored Endpoints"
          value={totalEndpoints}
          description="Continuous health check targets"
          icon={<Server className="w-4 h-4 text-primary" />}
        />

        <StateCard
          label="Healthy Endpoints"
          value={`${healthyCount} / ${totalEndpoints}`}
          description="Responding with HTTP 2xx status"
          icon={<CheckCircle2 className="w-4 h-4 text-success" />}
          valueClass="text-success"
        />

        <StateCard
          label="Avg Response Latency"
          value={`${avgLatency}ms`}
          description="Average response time across fleet"
          icon={<Clock className="w-4 h-4 text-primary" />}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Endpoints</CardTitle>
          <CardDescription className="text-xs">
            Dynamic live endpoint connectivity and latency metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={endpoints}
            isLoading={isLoading && !monitorsResponse}
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
            emptyMessage="No endpoints configured yet."
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Monitored API Endpoint"
        description="Provide the route or microservice URL to monitor continuously."
      >
        <form onSubmit={handleAddEndpoint} className="space-y-4 pt-2">
          <Input
            label="Service Name"
            placeholder="e.g. Stripe Webhook Handler"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Select
                label="HTTP Method"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value as "GET" | "POST")}
                options={[
                  { value: "GET", label: "GET" },
                  { value: "POST", label: "POST" },
                ]}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Endpoint URL / Path"
                placeholder="https://api.example.com/health"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMonitor.isPending}
            >
              Save & Start Monitoring
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
