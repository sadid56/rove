"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:4000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionToken) {
    headers["Cookie"] = `better-auth.session_token=${sessionToken}`;
  }
  return headers;
}

export async function deleteProject(projectId: string) {
  if (!projectId) throw new Error("Project ID is required");

  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/rpc/projects/delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: projectId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to delete project on server");
  }

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function createProject(data: { name: string; baseUrl: string }) {
  if (!data.name || !data.baseUrl) throw new Error("Name and baseUrl are required");

  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/rpc/projects/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to create project on server");
  }

  revalidatePath("/dashboard/projects");
  return await res.json();
}
