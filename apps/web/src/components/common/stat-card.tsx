import React, { type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";

export interface StatCardProps {
  label: string;
  value: string | number | ReactNode;
  description?: string;
  icon?: ReactNode;
  iconClass?: string;
  valueClass?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  iconClass = "text-muted-foreground",
  valueClass = "text-foreground",
  className = "",
  onClick,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`transition-all hover:border-border/80 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center justify-between">
          <span className="font-medium text-xs text-muted-foreground">{label}</span>
          {icon && (
            <span className={`shrink-0 ${iconClass}`}>
              {icon}
            </span>
          )}
        </CardDescription>
        <CardTitle className={`text-3xl font-bold tracking-tight ${valueClass}`}>
          {value}
        </CardTitle>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}

export const StateCard = StatCard;
