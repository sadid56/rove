import React, { useState } from "react";
import { Sheet, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Button, CodeBlock } from "@repo/ui";
import { Sparkles, AlertTriangle, AlertOctagon, CheckCircle2, Code2, RefreshCw, Video } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import { useAnalyzePageAi, type ScanRoute, type PageDetailInspection } from "@/react-query/scans/actions";

interface ScanRouteInspectorProps {
  selectedRoute: ScanRoute | null;
  pageDetail: PageDetailInspection | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function ScanRouteInspector({ selectedRoute, pageDetail, isLoading, onClose }: ScanRouteInspectorProps) {
  const { mutate: analyzeAi, isPending: isAnalyzing } = useAnalyzePageAi();

  const handleRunAi = () => {
    if (pageDetail?.id) {
      analyzeAi({ pageId: pageDetail.id });
    }
  };

  const hasIssues =
    pageDetail &&
    (pageDetail.healthStatus !== "healthy" ||
      (pageDetail.consoleEvents && pageDetail.consoleEvents.some((c) => c.type === "error")) ||
      (pageDetail.networkRequests && pageDetail.networkRequests.some((n) => n.failed)) ||
      (pageDetail.runtimeErrors && pageDetail.runtimeErrors.length > 0));

  const isHealthy = selectedRoute && (!selectedRoute.httpStatus || selectedRoute.httpStatus < 400);

  return (
    <Sheet
      isOpen={Boolean(selectedRoute)}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-base font-semibold text-foreground tracking-tight">
            {selectedRoute?.path}
          </span>
          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-mono font-medium border ${
              isHealthy
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            }`}
          >
            Status {selectedRoute?.httpStatus || 200}
          </span>
        </div>
      }
      description={
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-emerald-500" : "bg-destructive"}`} />
          <span>Tested in Playwright Chromium</span>
          {pageDetail?.loadTimeMs !== undefined && (
            <>
              <span className="text-border">•</span>
              <span>{pageDetail.loadTimeMs}ms load</span>
            </>
          )}
        </div>
      }
    >
      {isLoading || !pageDetail ? (
        <div className='space-y-4 pt-2'>
          <Skeleton className='h-60 w-full rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
          <div className='grid grid-cols-2 gap-3 pt-2'>
            <Skeleton className='h-16 w-full rounded-lg' />
            <Skeleton className='h-16 w-full rounded-lg' />
          </div>
        </div>
      ) : (
        <Tabs defaultValue={hasIssues ? "ai" : "overview"} className='w-full'>
          <TabsList className='w-full justify-start border-b border-border rounded-none p-0 bg-transparent gap-1 overflow-x-auto'>
            <TabsTrigger value='ai' className='gap-1.5 font-medium data-[state=active]:text-primary'>
              <Sparkles className='h-3.5 w-3.5 text-primary' />
              AI Fix & Insights
              {pageDetail.aiAnalysis && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                    pageDetail.aiAnalysis.severity === "critical"
                      ? "bg-destructive/20 text-destructive"
                      : pageDetail.aiAnalysis.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {pageDetail.aiAnalysis.severity}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='overview'>Overview & Media</TabsTrigger>
            <TabsTrigger value='console'>Console ({pageDetail.consoleEvents?.length || 0})</TabsTrigger>
            <TabsTrigger value='network'>Network ({pageDetail.networkRequests?.length || 0})</TabsTrigger>
            <TabsTrigger value='runtime'>Runtime ({pageDetail.runtimeErrors?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value='ai' className='space-y-4 pt-4'>
            <div className='flex items-center justify-between pb-1'>
              <div className='flex items-center gap-2'>
                <div className='h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center'>
                  <Sparkles className='h-4 w-4 text-primary' />
                </div>
                <div>
                  <h4 className='text-sm font-semibold text-foreground'>AI Autonomous Diagnosis</h4>
                  <p className='text-[11px] text-muted-foreground'>Root-cause triage & actionable fix recommendations</p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRunAi}
                disabled={isAnalyzing}
                className='h-8 gap-1.5 text-xs border-border'
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin text-primary" : ""}`} />
                {isAnalyzing ? "Analyzing..." : pageDetail.aiAnalysis ? "Re-diagnose" : "Run AI Triage"}
              </Button>
            </div>

            {pageDetail.aiAnalysis ? (
              <div className='space-y-3.5'>
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    pageDetail.aiAnalysis.severity === "critical"
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : pageDetail.aiAnalysis.severity === "warning"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  }`}
                >
                  <div className='mt-0.5 shrink-0'>
                    {pageDetail.aiAnalysis.severity === "critical" ? (
                      <AlertOctagon className='h-4 w-4' />
                    ) : pageDetail.aiAnalysis.severity === "warning" ? (
                      <AlertTriangle className='h-4 w-4' />
                    ) : (
                      <CheckCircle2 className='h-4 w-4' />
                    )}
                  </div>
                  <div className='space-y-1 text-xs'>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold uppercase tracking-wider text-[10px]'>Severity: {pageDetail.aiAnalysis.severity}</span>
                      {pageDetail.aiAnalysis.detectedCategories?.map((cat) => (
                        <span
                          key={cat}
                          className='px-1.5 py-0.5 rounded text-[9px] bg-background/60 border border-border text-foreground font-mono'
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className='font-semibold text-foreground text-sm'>{pageDetail.aiAnalysis.rootCause}</p>
                    <p className='text-muted-foreground text-xs leading-relaxed'>{pageDetail.aiAnalysis.summary}</p>
                  </div>
                </div>

                {pageDetail.aiAnalysis.impact && (
                  <div className='p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1'>
                    <span className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block'>User Impact</span>
                    <p className='text-foreground leading-relaxed'>{pageDetail.aiAnalysis.impact}</p>
                  </div>
                )}

                {pageDetail.aiAnalysis.suggestedFixes?.length > 0 && (
                  <div className='space-y-2'>
                    <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <CheckCircle2 className='h-3.5 w-3.5 text-primary' />
                      Step-by-Step Fix Instructions
                    </span>
                    <div className='space-y-1.5'>
                      {pageDetail.aiAnalysis.suggestedFixes.map((step, idx) => (
                        <div key={idx} className='p-2.5 rounded-lg bg-card border border-border text-xs flex items-start gap-2.5'>
                          <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]'>
                            {idx + 1}
                          </span>
                          <span className='text-foreground leading-relaxed pt-0.5'>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pageDetail.aiAnalysis.codePatch && (
                  <div className='space-y-2 pt-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                        <Code2 className='h-3.5 w-3.5 text-primary' />
                        Suggested Code Patch
                      </span>
                    </div>
                    <CodeBlock
                      code={pageDetail.aiAnalysis.codePatch}
                      language='typescript'
                      filename='patch-recommendation.ts'
                      showLineNumbers={true}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className='p-8 text-center rounded-xl border border-dashed border-border space-y-3'>
                <Sparkles className='h-8 w-8 text-primary mx-auto opacity-70 animate-pulse' />
                <div className='space-y-1 max-w-sm mx-auto'>
                  <h4 className='text-sm font-semibold text-foreground'>No AI Analysis Yet</h4>
                  <p className='text-xs text-muted-foreground'>
                    Run autonomous triage on this route to evaluate stack traces, hydration mismatches, and failed API responses.
                  </p>
                </div>
                <Button onClick={handleRunAi} disabled={isAnalyzing} size='sm' className='gap-2 text-xs'>
                  <Sparkles className='h-3.5 w-3.5' />
                  {isAnalyzing ? "Analyzing Route..." : "Analyze with AI"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value='overview' className='space-y-4 pt-4'>
            <div className='grid grid-cols-2 gap-3 text-xs'>
              <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>Load Duration</span>
                <span className='font-semibold text-foreground text-sm'>{pageDetail.loadTimeMs}ms</span>
              </div>
              <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                <span className='text-muted-foreground block text-[10px] uppercase'>Rendering Mode</span>
                <span className='font-semibold text-foreground text-sm uppercase'>{pageDetail.renderingType}</span>
              </div>
            </div>

            {pageDetail.healthReasons && pageDetail.healthReasons.length > 0 && (
              <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive'>
                <span className='font-semibold block mb-1'>Detected Issues:</span>
                <ul className='list-disc pl-4 space-y-0.5'>
                  {pageDetail.healthReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className='text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2'>
                <Video className='h-3.5 w-3.5 text-primary' />
                Session Video Recording
              </span>
              {pageDetail.videoUrl ? (
                <div className='rounded-lg border border-border overflow-hidden bg-black shadow-inner'>
                  <video
                    src={getMediaUrl(pageDetail.videoUrl)}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className='w-full max-h-72 object-contain'
                  />
                </div>
              ) : (
                <div className='p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg bg-secondary/15 flex items-center justify-center gap-2'>
                  <Video className='h-4 w-4 opacity-40' />
                  <span>No video was recorded for this past scan. New scans will capture video automatically.</span>
                </div>
              )}
            </div>

            <div>
              <span className='text-xs font-medium text-muted-foreground block mb-2'>Headless Browser Screenshot</span>
              {pageDetail.screenshotUrl ? (
                <div className='rounded-lg border border-border overflow-hidden bg-card'>
                  <img
                    src={getMediaUrl(pageDetail.screenshotUrl)}
                    alt={`Screenshot of ${pageDetail.path}`}
                    className='w-full object-cover'
                  />
                </div>
              ) : (
                <div className='p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg'>
                  Screenshot not captured for this route
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='console' className='space-y-3 pt-4'>
            {pageDetail.consoleEvents && pageDetail.consoleEvents.length > 0 ? (
              pageDetail.consoleEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 rounded-lg border text-xs ${
                    ev.type === "error"
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : ev.type === "warn"
                        ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-secondary/40 border-border text-foreground"
                  }`}
                >
                  <div className='flex items-center justify-between pb-1'>
                    <span className='font-bold uppercase text-[10px]'>{ev.type}</span>
                    {ev.location && <span className='text-muted-foreground text-[10px]'>{ev.location}</span>}
                  </div>
                  <p className='whitespace-pre-wrap break-all'>{ev.message}</p>
                  {ev.stack && (
                    <div className="mt-2.5">
                      <CodeBlock
                        code={ev.stack}
                        language="bash"
                        filename="Console Stack Trace"
                        showLineNumbers={false}
                        maxHeight="180px"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className='py-8 text-center text-xs text-muted-foreground'>Clean console. Zero errors or warnings detected.</div>
            )}
          </TabsContent>

          <TabsContent value='network' className='space-y-2 pt-4'>
            {pageDetail.networkRequests && pageDetail.networkRequests.length > 0 ? (
              pageDetail.networkRequests.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    req.failed ? "bg-destructive/10 border-destructive/30" : "bg-secondary/30 border-border"
                  }`}
                >
                  <div className='flex items-center gap-2 truncate max-w-md'>
                    <span className='text-[10px] font-bold text-muted-foreground uppercase'>{req.method}</span>
                    <span className='truncate text-foreground'>{req.url}</span>
                  </div>
                  <div className='flex items-center gap-3 shrink-0'>
                    <span className='text-muted-foreground text-[11px]'>{req.durationMs}ms</span>
                    <span className={`font-semibold ${req.failed ? "text-destructive" : "text-success"}`}>{req.status || "FAIL"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className='py-8 text-center text-xs text-muted-foreground'>No network requests captured</div>
            )}
          </TabsContent>

          <TabsContent value='runtime' className='space-y-3 pt-4'>
            {pageDetail.runtimeErrors && pageDetail.runtimeErrors.length > 0 ? (
              pageDetail.runtimeErrors.map((err) => (
                <div
                  key={err.id}
                  className='p-3.5 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-xs space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-xs uppercase'>{err.errorType} Error</span>
                    {err.source && <span className='text-[10px] text-muted-foreground'>{err.source}</span>}
                  </div>
                  <p className='font-semibold'>{err.message}</p>
                  {err.stack && (
                    <div className="mt-2.5">
                      <CodeBlock
                        code={err.stack}
                        language="bash"
                        filename={`${err.errorType} Trace`}
                        showLineNumbers={false}
                        maxHeight="220px"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className='py-8 text-center text-xs text-muted-foreground'>Zero uncaught exceptions or hydration mismatches.</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Sheet>
  );
}
