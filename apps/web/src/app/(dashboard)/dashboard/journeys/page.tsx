import type { Metadata } from "next";
import { JourneysView } from "@/features/journeys/components/journeys-view";

export const metadata: Metadata = {
  title: "User Journeys | Rove",
  description: "Autonomous E2E flow testing with self-healing locators",
};

export default function JourneysPage() {
  return <JourneysView />;
}
