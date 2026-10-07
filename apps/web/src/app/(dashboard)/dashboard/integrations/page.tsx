import type { Metadata } from "next";
import { IntegrationsView } from "@/features/integrations/components/integrations-view";

export const metadata: Metadata = {
  title: "CI/CD & Integrations | Rove",
  description: "GitHub Actions PR gatekeeper, Vercel hooks, and Slack webhook alerts",
};

export default function IntegrationsPage() {
  return <IntegrationsView />;
}
