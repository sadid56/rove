import React from "react";
import {
  Sheet,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
} from "@repo/ui";
import { getMediaUrl } from "@/lib/media";
import type { ScanRoute, PageDetailInspection } from "@/react-query/scans/actions";

interface ScanRouteInspectorProps {
  selectedRoute: ScanRoute | null;
  pageDetail: PageDetailInspection | undefined;
  isLoading: boolean;
  onClose: () => void;
}

export function ScanRouteInspector({
  selectedRoute,
  pageDetail,
  isLoading,
  onClose,
}: ScanRouteInspectorProps) {
  return (
    <Sheet
      isOpen={Boolean(selectedRoute)}
      onClose={onClose}
      title={selectedRoute?.path}
      description={`Tested in Playwright Chromium • Status ${selectedRoute?.httpStatus || 200}`}
    >
      {isLoading || !pageDetail ? (
        <div className="space-y-4 pt-2">
          <Skeleton className="h-60 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none p-0 bg-transparent">
            <TabsTrigger value="overview">Overview & Screenshot</TabsTrigger>
            <TabsTrigger value="console">
              Console ({pageDetail.consoleEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="network">
              Network ({pageDetail.networkRequests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="runtime">
              Runtime Errors ({pageDetail.runtimeErrors?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Load Duration
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {pageDetail.loadTimeMs}ms
                </span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Rendering Mode
                </span>
                <span className="font-semibold text-foreground text-sm uppercase">
                  {pageDetail.renderingType}
                </span>
              </div>
            </div>

            {pageDetail.healthReasons && pageDetail.healthReasons.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                <span className="font-semibold block mb-1">Detected Issues:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {pageDetail.healthReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="text-xs font-medium text-muted-foreground block mb-2">
                Headless Browser Screenshot
              </span>
              {pageDetail.screenshotUrl ? (
                <div className="rounded-lg border border-border overflow-hidden bg-card">
                  <img
                    src={getMediaUrl(pageDetail.screenshotUrl)}
                    alt={`Screenshot of ${pageDetail.path}`}
                    className="w-full object-cover"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  Screenshot not captured for this route
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="console" className="space-y-3 pt-4">
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
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-bold uppercase text-[10px]">{ev.type}</span>
                    {ev.location && (
                      <span className="text-muted-foreground text-[10px]">
                        {ev.location}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap break-all">{ev.message}</p>
                  {ev.stack && (
                    <pre className="text-[10px] text-muted-foreground mt-2 overflow-x-auto p-2 bg-background/80 rounded border border-border">
                      {ev.stack}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Clean console. Zero errors or warnings detected.
              </div>
            )}
          </TabsContent>

          <TabsContent value="network" className="space-y-2 pt-4">
            {pageDetail.networkRequests && pageDetail.networkRequests.length > 0 ? (
              pageDetail.networkRequests.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    req.failed
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-secondary/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate max-w-md">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {req.method}
                    </span>
                    <span className="truncate text-foreground">{req.url}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-muted-foreground text-[11px]">
                      {req.durationMs}ms
                    </span>
                    <span
                      className={`font-semibold ${
                        req.failed ? "text-destructive" : "text-success"
                      }`}
                    >
                      {req.status || "FAIL"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No network requests captured
              </div>
            )}
          </TabsContent>

          <TabsContent value="runtime" className="space-y-3 pt-4">
            {pageDetail.runtimeErrors && pageDetail.runtimeErrors.length > 0 ? (
              pageDetail.runtimeErrors.map((err) => (
                <div
                  key={err.id}
                  className="p-3.5 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase">
                      {err.errorType} Error
                    </span>
                    {err.source && (
                      <span className="text-[10px] text-muted-foreground">
                        {err.source}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold">{err.message}</p>
                  {err.stack && (
                    <pre className="text-[10px] text-destructive/80 overflow-x-auto p-2.5 bg-background/80 rounded border border-border">
                      {err.stack}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Zero uncaught exceptions or hydration mismatches.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </Sheet>
  );
}
