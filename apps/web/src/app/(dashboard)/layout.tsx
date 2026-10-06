import type { Metadata } from "next";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard | Rove",
  description: "Automated Production QA & Web Intelligence Platform",
};

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
