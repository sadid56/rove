"use client";

import React, { useState } from "react";
import { Eye, Sparkles, AlertOctagon, Scan, Maximize2 } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from "@repo/ui";
import { useVisionDefects, useRunVisionAudit } from "@/react-query/qa-suites/actions";
import { PageHeader } from "@/components/common";

export function AiAuditView() {
  const { data: defects = [], isLoading } = useVisionDefects();
  const runAuditMutation = useRunVisionAudit();
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);

  const selectedDefect = defects.find((d) => d.id === selectedDefectId) || defects[0];

  const handleAudit = async () => {
    await runAuditMutation.mutateAsync({ route: selectedDefect?.route });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='AI Vision Audit Studio'
        description='Multimodal Gemini Vision scans viewport screenshots to flag broken UI, clipped modals, and contrast bugs.'
        icon={<Eye className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='primary'
            size='sm'
            isLoading={runAuditMutation.isPending}
            onClick={handleAudit}
            leftIcon={<Sparkles className='w-4 h-4' />}
          >
            Run Vision Audit
          </Button>
        }
      />

      {isLoading ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Skeleton className='h-96 rounded-xl' />
          <Skeleton className='lg:col-span-2 h-96 rounded-xl' />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-foreground flex items-center gap-2'>
              <AlertOctagon className='w-4 h-4 text-warning' />
              Flagged Visual Anomalies ({defects.length})
            </h3>

            {defects.map((d) => {
              const isSelected = selectedDefect?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDefectId(d.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                    isSelected ? "bg-secondary border-primary/50 shadow-xs" : "bg-card border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='font-mono text-[11px] text-muted-foreground truncate'>{d.route}</span>
                    <Badge
                      variant={d.severity === "critical" ? "failed" : d.severity === "warning" ? "warning" : "info"}
                      className='text-[10px] uppercase'
                    >
                      {d.severity}
                    </Badge>
                  </div>
                  <p className='font-semibold text-foreground line-clamp-1'>{d.title}</p>
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1'>
                    <span>Category: {d.category}</span>
                    <span className='text-primary font-medium'>{d.confidence}% AI Confidence</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='lg:col-span-2'>
            {selectedDefect ? (
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <CardTitle className='text-base font-semibold'>{selectedDefect.title}</CardTitle>
                      <CardDescription className='text-xs font-mono mt-0.5'>Route: {selectedDefect.route}</CardDescription>
                    </div>
                    <Badge variant='warning' className='text-xs uppercase'>
                      {selectedDefect.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='relative aspect-video rounded-xl bg-secondary/80 border border-border flex flex-col items-center justify-center overflow-hidden p-6 text-center'>
                    <div className='absolute inset-0 bg-radial from-primary/10 to-transparent pointer-events-none' />
                    <Scan className='w-12 h-12 text-primary/60 mb-2 animate-pulse' />
                    <p className='text-xs font-medium text-foreground'>Multimodal Viewport Inspection Active</p>
                    <p className='text-[11px] text-muted-foreground mt-1 max-w-sm'>
                      Gemini Vision verified layout boundary box for `{selectedDefect.route}` at 375px mobile viewport.
                    </p>

                    <div className='absolute bottom-3 right-3 flex items-center gap-2'>
                      <Button variant='outline' size='sm' className='h-7 text-[11px]' leftIcon={<Maximize2 className='w-3 h-3' />}>
                        Inspect Canvas
                      </Button>
                    </div>
                  </div>

                  <div className='p-4 rounded-xl bg-secondary/40 border border-border space-y-2'>
                    <div className='flex items-center justify-between text-xs font-semibold text-foreground'>
                      <span className='flex items-center gap-1.5'>
                        <Sparkles className='w-3.5 h-3.5 text-primary' />
                        AI Multimodal Diagnosis & Root Cause
                      </span>
                      <span className='text-primary'>{selectedDefect.confidence}% Confidence</span>
                    </div>
                    <p className='text-xs text-muted-foreground leading-relaxed'>{selectedDefect.aiExplanation}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className='p-12 text-center text-xs text-muted-foreground'>No visual defects selected.</Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
