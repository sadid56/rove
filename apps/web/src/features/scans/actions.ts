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

export async function cancelScan(scanId: string) {
  if (!scanId) throw new Error("Scan ID is required");

  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/rpc/scans.updateStatus`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: scanId, status: "cancelled" }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to cancel scan on server");
  }

  revalidatePath(`/dashboard/scans/${scanId}`);
  revalidatePath("/dashboard/scans");
  return { success: true };
}
