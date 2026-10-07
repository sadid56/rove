import React from "react";
import { Activity, Layers, FileCode2, XCircle, type LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common";

export interface DashboardStatsData {
  averageHealth: number;
  completedScansCount: number;
  totalScans: number;
  totalRoutesTested: number;
  totalFailedIssues: number;
}

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  valueClass?: string;
  iconClass?: string;
}

export function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const statItems: StatItem[] = [
    {
      id: "health",
      label: "Overall Health",
      value: `${stats.averageHealth}%`,
      description: `Based on ${stats.completedScansCount} completed scans`,
      icon: Activity,
      valueClass: "text-success",
      iconClass: "text-success",
    },
    {
      id: "total",
      label: "Total Scans",
      value: stats.totalScans,
      description: "Production & staging runs",
      icon: Layers,
      valueClass: "text-foreground",
      iconClass: "text-primary",
    },
    {
      id: "routes",
      label: "Routes Tested",
      value: stats.totalRoutesTested,
      description: "Discovered and inspected",
      icon: FileCode2,
      valueClass: "text-foreground",
      iconClass: "text-primary",
    },
    {
      id: "failed",
      label: "Failed Pages",
      value: stats.totalFailedIssues,
      description: "Hydration, 5xx, or JS errors",
      icon: XCircle,
      valueClass: stats.totalFailedIssues > 0 ? "text-destructive" : "text-foreground",
      iconClass: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <StatCard
          key={item.id}
          label={item.label}
          value={item.value}
          description={item.description}
          icon={<item.icon className="w-4 h-4" />}
          valueClass={item.valueClass}
          iconClass={item.iconClass}
        />
      ))}
    </div>
  );
}
