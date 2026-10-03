import type { Metadata } from "next";
import { SettingsView } from "@/features/settings/components/settings-view";

export const metadata: Metadata = {
  title: "Settings | Rove",
  description:
    "Manage your crawler policies, Playwright browser engine limits, and platform preferences",
};

export default function SettingsPage() {
  return <SettingsView />;
}
