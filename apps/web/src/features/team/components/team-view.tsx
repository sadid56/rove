"use client";

import React, { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Users, UserPlus } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  Input,
  Select,
  DataTable,
  type ColumnDef,
} from "@repo/ui";
import {
  useTeamMembers,
  useInviteTeamMember,
  type TeamMemberItem,
} from "@/react-query/qa-suites/actions";
import { PageHeader } from "@/components/common";

export function TeamView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const { data: teamResponse, isLoading } = useTeamMembers({ page, pageSize });
  const inviteMember = useInviteTeamMember();

  const members = teamResponse?.items || [];
  const totalCount = teamResponse?.totalCount || 0;
  const totalPages = teamResponse?.totalPages || 1;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMemberItem["role"]>("Developer");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    await inviteMember.mutateAsync({
      email: inviteEmail.trim(),
      role: inviteRole,
    });

    setInviteEmail("");
    setIsModalOpen(false);
  };

  const columns: ColumnDef<TeamMemberItem>[] = [
    {
      header: "Collaborator",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
            {row.avatarInitials}
          </div>
          <span className="font-semibold text-xs text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ value }) => <span className="text-xs text-muted-foreground">{value}</span>,
    },
    {
      header: "Assigned Role",
      accessorKey: "role",
      cell: ({ value }) => (
        <Badge
          variant={
            value === "Owner"
              ? "healthy"
              : value === "Admin" || value === "QA Lead"
              ? "info"
              : "neutral"
          }
          className="text-[10px]"
        >
          {value}
        </Badge>
      ),
    },
    {
      header: "Activity",
      accessorKey: "lastActive",
      cell: ({ value }) => (
        <span className="text-xs text-muted-foreground">{value || "Invited"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members & Role Access Control"
        description="Manage your QA organization workspace, role-based permissions, and invite collaborators."
        icon={<Users className="w-6 h-6 text-primary" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Collaborators</CardTitle>
          <CardDescription className="text-xs">
            Members have access to trigger scans, inspect runtime errors, and review visual regressions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={members}
            isLoading={isLoading && !teamResponse}
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
            emptyMessage="No team members found."
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join this Rove workspace with specific QA permissions."
      >
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="developer@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            options={[
              { value: "Admin", label: "Admin - Full Organization Access" },
              { value: "QA Lead", label: "QA Lead - Manage Suites & Fix PRs" },
              { value: "Developer", label: "Developer - Trigger Scans & View Reports" },
              { value: "Viewer", label: "Viewer - Read-only Metrics" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={inviteMember.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
