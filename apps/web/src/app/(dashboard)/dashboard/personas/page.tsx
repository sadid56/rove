import type { Metadata } from "next";
import { PersonasView } from "@/features/personas/components/personas-view";

export const metadata: Metadata = {
  title: "Synthetic Personas | Rove",
  description: "Chaos testing, rage-clicking, and network resilience evaluation",
};

export default function PersonasPage() {
  return <PersonasView />;
}
