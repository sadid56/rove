"use client";

import React, { useState } from "react";
import { Users2, Zap, WifiOff, Flame, Accessibility, Play, RotateCcw } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from "@repo/ui";
import { usePersonas, useRunPersona, type PersonaItem } from "@/react-query/qa-suites/actions";
import { PageHeader } from "@/components/common";

const PERSONA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "p-1": Flame,
  "p-2": WifiOff,
  "p-3": Accessibility,
  "p-4": Zap,
};

export function PersonasView() {
  const { data: personas = [], isLoading } = usePersonas();
  const runMutation = useRunPersona();
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleRunPersona = async (id: string) => {
    setRunningId(id);
    try {
      await runMutation.mutateAsync({ id: id === "all" ? personas[0]?.id || "p-1" : id });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Synthetic Personas & Chaos Testing"
        description="Simulate realistic edge-case user behaviors: rage clicking, network latency, accessibility, and third-party drops."
        icon={<Users2 className="w-6 h-6 text-primary" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleRunPersona("all")}
            isLoading={runningId === "all"}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Run All Personas
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((persona) => {
            const Icon = PERSONA_ICONS[persona.id] || Users2;
            const isRunning = runningId === persona.id || runningId === "all";

            return (
              <Card key={persona.id} className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">{persona.name}</CardTitle>
                          <CardDescription className="text-xs">{persona.role}</CardDescription>
                        </div>
                      </div>

                      <Badge
                        variant={
                          persona.status === "passed"
                            ? "healthy"
                            : persona.status === "warning"
                            ? "warning"
                            : "failed"
                        }
                        className="uppercase text-[10px]"
                      >
                        {persona.status} ({persona.healthScore}%)
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{persona.description}</p>

                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs space-y-1">
                      <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                        Simulated Stress Behavior
                      </span>
                      <p className="text-muted-foreground">{persona.behavior}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Live QA Findings
                      </span>
                      <ul className="space-y-1 text-xs">
                        {persona.findings.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-foreground/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 border-t border-border mt-2 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Target: <span className="font-mono text-foreground">Global Headless Cluster</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    isLoading={isRunning}
                    onClick={() => handleRunPersona(persona.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Simulate Persona
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
