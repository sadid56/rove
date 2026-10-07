import type { Metadata } from "next";
import { IssuesView } from "@/features/issues/components/issues-view";

export const metadata: Metadata = {
  title: "Issue Tracker | Rove",
  description: "QA bug triage board, developer assignments, and resolution lifecycles",
};

export default function IssuesPage() {
  return <IssuesView />;
}
