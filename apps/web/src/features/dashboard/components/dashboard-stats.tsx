import React from "react";
import { Activity, Layers, FileCode2, XCircle, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";

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
        <Card key={item.id} className="transition-all hover:border-border/80">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span className="font-medium text-xs text-muted-foreground">{item.label}</span>
              <item.icon className={`w-4 h-4 ${item.iconClass || "text-muted-foreground"}`} />
            </CardDescription>
            <CardTitle className={`text-3xl font-bold tracking-tight ${item.valueClass || "text-foreground"}`}>
              {item.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
