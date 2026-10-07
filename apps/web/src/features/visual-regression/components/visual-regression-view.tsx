"use client";

import React, { useState } from "react";
import { Eye, Smartphone, Tablet, Monitor, Check, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";
import { PageHeader } from "@/components/common";

interface SnapshotDiff {
  id: string;
  route: string;
  diffPercentage: number;
  viewport: "desktop" | "tablet" | "mobile";
  status: "unreviewed" | "accepted" | "rejected";
  detectedShift: string;
}

const MOCK_DIFFS: SnapshotDiff[] = [
  {
    id: "diff-1",
    route: "/pricing",
    diffPercentage: 3.8,
    viewport: "desktop",
    status: "unreviewed",
    detectedShift: "Pricing card CTA padding shifted 12px downward; currency symbol misalignment.",
  },
  {
    id: "diff-2",
    route: "/checkout",
    diffPercentage: 8.4,
    viewport: "mobile",
    status: "unreviewed",
    detectedShift: "Order summary drawer clips checkout button on 375px width viewports.",
  },
  {
    id: "diff-3",
    route: "/features",
    diffPercentage: 1.2,
    viewport: "desktop",
    status: "accepted",
    detectedShift: "Updated hero graphic asset rendered.",
  },
];

export function VisualRegressionView() {
  const [diffs, setDiffs] = useState<SnapshotDiff[]>(MOCK_DIFFS);
  const [selectedDiff, setSelectedDiff] = useState<SnapshotDiff>(MOCK_DIFFS[0]!);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [aiNoiseFilter, setAiNoiseFilter] = useState(true);
  const [selectedViewport, setSelectedViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const handleStatusChange = (id: string, status: "accepted" | "rejected") => {
    setDiffs((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    if (selectedDiff.id === id) {
      setSelectedDiff((prev) => ({ ...prev, status }));
    }
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Visual Regression & Layout Diff'
        description='Detect unintended layout shifts, CSS breakages, and pixel regressions with AI dynamic noise suppression.'
        icon={<Eye className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant={aiNoiseFilter ? "primary" : "outline"}
            size='sm'
            onClick={() => setAiNoiseFilter(!aiNoiseFilter)}
            leftIcon={<Sparkles className='w-4 h-4' />}
          >
            AI Noise Filter: {aiNoiseFilter ? "ON" : "OFF"}
          </Button>
        }
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1 space-y-3'>
          <div className='flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            <span>Detected Diffs ({diffs.length})</span>
            <div className='flex items-center gap-1'>
              <Button
                variant={selectedViewport === "desktop" ? "primary" : "ghost"}
                size='icon'
                className='h-6 w-6'
                onClick={() => setSelectedViewport("desktop")}
                title='Desktop'
              >
                <Monitor className='w-3.5 h-3.5' />
              </Button>
              <Button
                variant={selectedViewport === "tablet" ? "primary" : "ghost"}
                size='icon'
                className='h-6 w-6'
                onClick={() => setSelectedViewport("tablet")}
                title='Tablet'
              >
                <Tablet className='w-3.5 h-3.5' />
              </Button>
              <Button
                variant={selectedViewport === "mobile" ? "primary" : "ghost"}
                size='icon'
                className='h-6 w-6'
                onClick={() => setSelectedViewport("mobile")}
                title='Mobile'
              >
                <Smartphone className='w-3.5 h-3.5' />
              </Button>
            </div>
          </div>

          {diffs.map((diff) => {
            const isSelected = selectedDiff.id === diff.id;
            return (
              <div
                key={diff.id}
                onClick={() => setSelectedDiff(diff)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? "bg-secondary/70 border-primary/50 shadow-xs" : "bg-card border-border hover:bg-secondary/40"
                }`}
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-semibold text-sm text-foreground'>{diff.route}</span>
                  <Badge variant={diff.diffPercentage > 5 ? "failed" : "warning"} className='text-[10px]'>
                    {diff.diffPercentage}% diff
                  </Badge>
                </div>

                <p className='text-xs text-muted-foreground mt-1.5 line-clamp-2'>{diff.detectedShift}</p>

                <div className='flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-[11px]'>
                  <span className='text-muted-foreground uppercase tracking-wide'>{diff.viewport}</span>
                  <Badge
                    variant={diff.status === "accepted" ? "healthy" : diff.status === "rejected" ? "failed" : "neutral"}
                    className='text-[9px] uppercase'
                  >
                    {diff.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        <div className='lg:col-span-2'>
          <Card className='flex flex-col h-full'>
            <CardHeader className='flex flex-row items-center justify-between border-b border-border pb-4'>
              <div>
                <CardTitle className='text-base flex items-center gap-2'>
                  <span>{selectedDiff.route}</span>
                  <span className='text-xs font-normal text-muted-foreground'>({selectedDiff.viewport})</span>
                </CardTitle>
                <CardDescription className='text-xs mt-1'>{selectedDiff.detectedShift}</CardDescription>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleStatusChange(selectedDiff.id, "rejected")}
                  leftIcon={<X className='w-3.5 h-3.5 text-destructive' />}
                >
                  Reject Shift
                </Button>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() => handleStatusChange(selectedDiff.id, "accepted")}
                  leftIcon={<Check className='w-3.5 h-3.5' />}
                >
                  Accept Baseline
                </Button>
              </div>
            </CardHeader>

            <CardContent className='p-6 flex-1 flex flex-col justify-between space-y-4'>
              <div className='relative w-full h-80 rounded-xl border border-border bg-black/40 overflow-hidden flex items-center justify-center select-none'>
                <div
                  className='absolute inset-0 bg-secondary/30 flex items-center justify-center text-xs text-muted-foreground border-r-2 border-primary'
                  style={{ width: `${sliderPosition}%` }}
                >
                  <div className='absolute top-3 left-3 bg-card/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-semibold text-foreground border border-border'>
                    Baseline Scan (v1.4)
                  </div>
                </div>

                <div className='absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none'>
                  <div className='absolute top-3 right-3 bg-card/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-semibold text-primary border border-primary/30'>
                    Current Deployment (v1.5)
                  </div>
                </div>

                <div className='absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg' style={{ left: `${sliderPosition}%` }}>
                  <div className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md'>
                    <SlidersHorizontal className='w-3 h-3' />
                  </div>
                </div>
              </div>

              <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Interactive Split Slider</span>
                  <span>{sliderPosition}% Current View</span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className='w-full accent-primary cursor-ew-resize'
                />
              </div>

              {aiNoiseFilter && (
                <div className='p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 shrink-0' />
                  <span>AI Noise Suppression Active: Ignored 4 dynamic timestamp strings and rotating carousel ads.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
