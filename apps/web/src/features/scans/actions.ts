"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/orpc.server";

export async function cancelScan(scanId: string) {
  if (!scanId) throw new Error("Scan ID is required");

  const result = await api.scans.updateStatus({
    id: scanId,
    status: "cancelled",
  });

  revalidatePath(`/dashboard/scans/${scanId}`);
  revalidatePath("/dashboard/scans");
  return result;
}
