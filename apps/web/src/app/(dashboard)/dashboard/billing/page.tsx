import type { Metadata } from "next";
import { BillingView } from "@/features/billing/components/billing-view";

export const metadata: Metadata = {
  title: "Billing & Plans | Rove",
  description: "Subscription tiers, concurrency quotas, and payment management",
};

export default function BillingPage() {
  return <BillingView />;
}
