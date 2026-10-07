import type { Metadata } from "next";
import { AiFixesView } from "@/features/ai-studio/components/ai-fixes-view";

export const metadata: Metadata = {
  title: "AI Fix Generator | Rove",
  description: "Autonomous code patch generator with one-click GitHub Pull Request creation",
};

export default function AiFixesPage() {
  return <AiFixesView />;
}
