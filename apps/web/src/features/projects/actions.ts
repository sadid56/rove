"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/orpc.server";
import type { CreateProjectInput } from "@repo/contract";

export async function deleteProject(projectId: string) {
  if (!projectId) throw new Error("Project ID is required");

  const result = await api.projects.delete({ id: projectId });
  revalidatePath("/dashboard/projects");
  return result;
}

export async function createProject(data: CreateProjectInput) {
  if (!data.name || !data.baseUrl) throw new Error("Name and baseUrl are required");

  const result = await api.projects.create(data);
  revalidatePath("/dashboard/projects");
  return result;
}
