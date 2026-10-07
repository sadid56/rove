import type { Metadata } from "next";
import { VisualRegressionView } from "@/features/visual-regression/components/visual-regression-view";

export const metadata: Metadata = {
  title: "Visual Regression | Rove",
  description: "Pixel-diff and layout regression detection with AI noise suppression",
};

export default function VisualRegressionPage() {
  return <VisualRegressionView />;
}
