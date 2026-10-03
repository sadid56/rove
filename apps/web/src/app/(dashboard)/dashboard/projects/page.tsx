import type { Metadata } from "next";
import { ProjectsView } from "@/features/projects/components/projects-view";

export const metadata: Metadata = {
  title: "Projects | Rove",
  description:
    "Organize applications, manage scanning targets, and monitor deployment health across repositories",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
