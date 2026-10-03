import type { Metadata } from "next";
import { ScansView } from "@/features/scans/components/scans-view";

export const metadata: Metadata = {
  title: "Scan History | Rove",
  description:
    "Review automated real-browser test results, regression signals, and route coverage",
};

export default function ScansListPage() {
  return <ScansView />;
}
