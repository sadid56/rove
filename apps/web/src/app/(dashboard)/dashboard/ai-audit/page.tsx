import type { Metadata } from "next";
import { AiAuditView } from "@/features/ai-studio/components/ai-audit-view";

export const metadata: Metadata = {
  title: "AI Vision Audit | Rove",
  description: "Multimodal Gemini Vision inspection for visual defects, layout breaks, and contrast",
};

export default function AiAuditPage() {
  return <AiAuditView />;
}
