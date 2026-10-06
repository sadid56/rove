"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Globe, Trash2, Play, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Modal,
  Input,
  Skeleton,
} from "@repo/ui";
import { useProjects, useCreateProject, useDeleteProject } from "@/react-query/projects/actions";
import { useTriggerScan } from "@/react-query/scans/actions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createProjectFormSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  baseUrl: z.string().url("Must be a valid URL (e.g. https://example.com)")
});

type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

export function ProjectsView() {
  const router = useRouter();
  const { data: projects, isLoading, refetch } = useProjects();
  const createProject = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const triggerScan = useTriggerScan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors }
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      baseUrl: ""
    }
  });

  const onHandleCreate = async (data: CreateProjectFormValues) => {
    try {
      await createProject.mutateAsync({ name: data.name.trim(), baseUrl: data.baseUrl.trim() });
      resetCreateForm();
      setIsModalOpen(false);
    } catch {
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      setDeletingId(projectId);
      await deleteProjectMutation.mutateAsync(projectId);
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const handleRunScan = async (projectId: string, url: string) => {
    try {
      const scan = await triggerScan.mutateAsync({ targetUrl: url, projectId });
      if (scan && scan.id) {
        router.push(`/dashboard/scans/${scan.id}`);
      }
    } catch {
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Monitored Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize applications, manage scanning targets, and monitor deployment
            health across repositories.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Skeleton className="h-3 w-28" />
              </CardContent>
              <div className="p-6 pt-0 border-t border-border mt-4 flex items-center justify-between">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-3">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No projects configured
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Add your first web application to track route discovery, console
              errors, and deployment regressions.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold truncate">
                      {project.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      isLoading={deletingId === project.id}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-xs pt-1 truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline hover:text-foreground flex items-center gap-1 truncate"
                    >
                      {project.url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleRunScan(project.id, project.url)}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Run Scan
                </Button>
                <Link href={`/dashboard?project=${project.id}`}>
                  <Button size="sm" variant="outline">
                    History
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Monitored Application"
        description="Configure a new web application target for automated route crawling and QA testing."
      >
        <form onSubmit={handleCreateSubmit(onHandleCreate)} className="space-y-4 pt-2">
          <Input
            label="Project Name"
            placeholder="e.g. DesignX E-Commerce"
            error={createErrors.name?.message}
            {...register("name")}
          />
          <Input
            label="Base Target URL"
            type="url"
            placeholder="https://example.com"
            leftIcon={<Globe className="w-4 h-4" />}
            error={createErrors.baseUrl?.message}
            {...register("baseUrl")}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createProject.isPending}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
