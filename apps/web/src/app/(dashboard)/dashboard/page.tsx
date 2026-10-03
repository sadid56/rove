import type { Metadata } from "next";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard Overview | Rove",
  description:
    "Automated production web application intelligence & automated QA monitoring",
};

export default function DashboardOverviewPage() {
  return <DashboardOverview />;
}
