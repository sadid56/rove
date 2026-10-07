import type { Metadata } from "next";
import { ApiMonitorView } from "@/features/api-monitor/components/api-monitor-view";

export const metadata: Metadata = {
  title: "API Health Monitor | Rove",
  description: "Real-time latency, ping, and SLA monitoring for critical frontend endpoints",
};

export default function ApiMonitorPage() {
  return <ApiMonitorView />;
}
