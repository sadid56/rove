import type { Metadata } from "next";
import { ScanDetailView } from "@/features/scans/components/scan-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Scan Report #${id.slice(0, 8)} | Rove`,
    description: "Detailed production real-browser inspection report and route health metrics",
  };
}

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScanDetailView scanId={id} />;
}
