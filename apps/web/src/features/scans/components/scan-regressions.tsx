import React from "react";
import { Flame, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@repo/ui";
import type { RegressionItem } from "@/react-query/scans/actions";

interface ScanRegressionsProps {
  regressions?: RegressionItem[];
}

export function ScanRegressions({ regressions }: ScanRegressionsProps) {
  if (!regressions || regressions.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/40 bg-destructive/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
          <Flame className="w-5 h-5 shrink-0" />
          Deployment Regressions Detected ({regressions.length})
        </CardTitle>
        <CardDescription className="text-xs text-destructive/80">
          The following routes broke or degraded compared to the previous deployment scan:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {regressions.map((reg) => (
          <div
            key={reg.id}
            className="flex items-center justify-between text-xs bg-background/50 border border-destructive/30 p-2.5 rounded-lg"
          >
            <div className="flex items-center gap-2 truncate">
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {reg.path}
              </span>
              <span className="text-muted-foreground">
                — {reg.details?.evidence}
              </span>
            </div>
            <Badge variant="failed">{reg.changeType.replace("_", " ")}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
