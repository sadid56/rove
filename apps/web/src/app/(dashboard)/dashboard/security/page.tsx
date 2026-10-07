import type { Metadata } from "next";
import { SecurityView } from "@/features/security/components/security-view";

export const metadata: Metadata = {
  title: "Security Sentinel | Rove",
  description: "Automated secret leak detection, PII audit, and OWASP web vulnerability compliance",
};

export default function SecurityPage() {
  return <SecurityView />;
}
