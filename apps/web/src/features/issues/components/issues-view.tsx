"use client";

import React, { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Bug, Plus, User, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button, Badge, Card, CardContent, Modal, Input, Select, DataTable, type ColumnDef } from "@repo/ui";
import { useIssues, useCreateIssue, useUpdateIssueStatus, type QaIssueItem } from "@/react-query/qa-suites/actions";
import { PageHeader, StateCard } from "@/components/common";

export function IssuesView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [filterStatus, setFilterStatus] = useQueryState("status", {
    defaultValue: "all",
  });

  const { data: issuesResponse, isLoading } = useIssues({
    status: filterStatus === "all" ? undefined : filterStatus,
    page,
    pageSize,
  });

  const issues = issuesResponse?.items || [];
  const totalCount = issuesResponse?.totalCount || 0;
  const totalPages = issuesResponse?.totalPages || 1;
  const counts = issuesResponse?.counts;

  const createIssue = useCreateIssue();
  const updateStatus = useUpdateIssueStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [newSeverity, setNewSeverity] = useState<"critical" | "high" | "medium">("high");

  const handleFilterChange = (status: "all" | "open" | "in_progress" | "resolved") => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleStatusToggle = async (issue: QaIssueItem) => {
    const nextStatus = issue.status === "open" ? "in_progress" : issue.status === "in_progress" ? "resolved" : "open";

    await updateStatus.mutateAsync({
      id: issue.id,
      status: nextStatus,
    });
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRoute.trim()) return;

    await createIssue.mutateAsync({
      title: newTitle.trim(),
      route: newRoute.trim(),
      type: "Manual Bug",
      severity: newSeverity,
    });

    setNewTitle("");
    setNewRoute("");
    setIsModalOpen(false);
  };

  const columns: ColumnDef<QaIssueItem>[] = [
    {
      header: "Issue Key & Title",
      accessorKey: "title",
      cell: ({ row }) => (
        <div>
          <div className='flex items-center gap-2'>
            <span className='font-mono text-[11px] font-bold text-muted-foreground'>{row.issueKey}</span>
            <span className='font-medium text-xs text-foreground'>{row.title}</span>
          </div>
          <span className='text-[10px] text-muted-foreground block mt-0.5'>Reported {row.reportedAt || "Recently"}</span>
        </div>
      ),
    },
    {
      header: "Affected Route",
      accessorKey: "route",
      cell: ({ value }) => <span className='font-mono text-xs text-muted-foreground'>{value}</span>,
    },
    {
      header: "Category",
      accessorKey: "type",
      cell: ({ value }) => <span className='text-xs text-foreground'>{value}</span>,
    },
    {
      header: "Severity",
      accessorKey: "severity",
      cell: ({ value }) => (
        <Badge variant={value === "critical" ? "failed" : value === "high" ? "warning" : "info"} className='text-[9px] uppercase'>
          {value}
        </Badge>
      ),
    },
    {
      header: "Assignee",
      accessorKey: "assignee",
      cell: ({ value }) => (
        <div className='flex items-center gap-1.5 text-xs text-foreground'>
          <User className='w-3.5 h-3.5 text-muted-foreground' />
          <span>{value || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ value }) => (
        <Badge variant={value === "resolved" ? "healthy" : value === "in_progress" ? "info" : "warning"} className='text-[9px] uppercase'>
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            onClick={() => handleStatusToggle(row)}
            disabled={updateStatus.isPending}
          >
            {row.status === "open" ? "Mark In-Progress" : row.status === "in_progress" ? "Resolve" : "Reopen"}
          </Button>
        </div>
      ),
    },
  ];

  const totalIssuesCount = counts?.all ?? totalCount;
  const openCount = counts?.open ?? 0;
  const inProgressCount = counts?.inProgress ?? 0;
  const resolvedCount = counts?.resolved ?? 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        title='QA Issue Tracker & Bug Triage'
        description='Track automated scan regressions, console exceptions, and visual defect tickets.'
        icon={<Bug className='w-6 h-6 text-primary' />}
        actions={
          <Button variant='primary' size='sm' onClick={() => setIsModalOpen(true)} leftIcon={<Plus className='w-4 h-4' />}>
            Report Issue
          </Button>
        }
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StateCard
          label='Total Issues'
          value={totalIssuesCount}
          description='All recorded regressions & tickets'
          icon={<Bug className='w-4 h-4 text-primary' />}
          onClick={() => handleFilterChange("all")}
          className={filterStatus === "all" ? "ring-2 ring-primary/40 border-primary" : ""}
        />
        <StateCard
          label='Open Issues'
          value={openCount}
          description='Awaiting triage or code fix'
          icon={<AlertCircle className='w-4 h-4 text-warning' />}
          valueClass={openCount > 0 ? "text-warning" : "text-foreground"}
          onClick={() => handleFilterChange("open")}
          className={filterStatus === "open" ? "ring-2 ring-warning/40 border-warning" : ""}
        />
        <StateCard
          label='In Progress'
          value={inProgressCount}
          description='Fix branch or PR created'
          icon={<Clock className='w-4 h-4 text-primary' />}
          valueClass='text-primary'
          onClick={() => handleFilterChange("in_progress")}
          className={filterStatus === "in_progress" ? "ring-2 ring-primary/40 border-primary" : ""}
        />
        <StateCard
          label='Resolved Issues'
          value={resolvedCount}
          description='Closed & regression verified'
          icon={<CheckCircle2 className='w-4 h-4 text-success' />}
          valueClass='text-success'
          onClick={() => handleFilterChange("resolved")}
          className={filterStatus === "resolved" ? "ring-2 ring-success/40 border-success" : ""}
        />
      </div>

      <div className='flex items-center gap-2'>
        <Button variant={filterStatus === "all" ? "primary" : "outline"} size='sm' onClick={() => handleFilterChange("all")}>
          All ({totalIssuesCount})
        </Button>
        <Button variant={filterStatus === "open" ? "primary" : "outline"} size='sm' onClick={() => handleFilterChange("open")}>
          Open ({openCount})
        </Button>
        <Button variant={filterStatus === "in_progress" ? "primary" : "outline"} size='sm' onClick={() => handleFilterChange("in_progress")}>
          In Progress ({inProgressCount})
        </Button>
        <Button variant={filterStatus === "resolved" ? "primary" : "outline"} size='sm' onClick={() => handleFilterChange("resolved")}>
          Resolved ({resolvedCount})
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <DataTable
            columns={columns}
            data={issues}
            isLoading={isLoading && !issuesResponse}
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
            emptyMessage='No issues found for this filter.'
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Report New QA Bug'
        description='Submit a manual issue or defect ticket linked to a specific frontend route.'
      >
        <form onSubmit={handleCreateIssue} className='space-y-4 pt-2'>
          <Input
            label='Issue Title'
            placeholder='e.g. Broken checkout form submit handler'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Input
            label='Affected Route / URL'
            placeholder='/dashboard/checkout or https://...'
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
            required
          />

          <Select
            label='Severity'
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value as any)}
            options={[
              { value: "critical", label: "Critical - Blocker / Crash" },
              { value: "high", label: "High - Feature Malfunction" },
              { value: "medium", label: "Medium - Cosmetic / Warning" },
            ]}
          />

          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' size='sm' type='button' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant='primary' size='sm' type='submit' isLoading={createIssue.isPending}>
              Create Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
