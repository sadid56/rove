import type { Metadata } from "next";
import { TeamView } from "@/features/team/components/team-view";

export const metadata: Metadata = {
  title: "Team & Roles | Rove",
  description: "Collaborator management and role-based access control for QA testing",
};

export default function TeamPage() {
  return <TeamView />;
}
