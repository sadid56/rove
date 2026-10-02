import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks/useAppMutation";
import { client } from "@/lib/orpc";
import { projectsKeys } from "./keys";

export interface Project {
  id: string;
  name: string;
  url: string;
  slug: string;
  crawlerConfig?: {
    maxPages?: number;
    respectRobots?: boolean;
    sameOrigin?: boolean;
    excludedPaths?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  return useQuery({
    queryKey: projectsKeys.lists(),
    queryFn: () => client.projects.list() as Promise<Project[]>
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => client.projects.get({ id }) as Promise<Project>,
    enabled: Boolean(id)
  });
}

export function useCreateProject() {
  return useAppMutation<{ name: string; baseUrl: string }>({
    mutationFn: (data) => client.projects.create(data),
    invalidateKeys: [["projects"]],
    successMessage: "Project created successfully",
    errorMessage: "Failed to create project"
  });
}

export function useDeleteProject() {
  return useAppMutation<string>({
    mutationFn: (id) => client.projects.delete({ id }),
    invalidateKeys: [["projects"]],
    successMessage: "Project deleted successfully",
    errorMessage: "Failed to delete project"
  });
}
