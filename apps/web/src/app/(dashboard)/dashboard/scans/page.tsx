"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowRight, ShieldCheck, XCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton
} from "@repo/ui";
import { useScans } from "@/react-query/scans/actions";

export default function ScansListPage() {
  const { data: scans, isLoading } = useScans();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">QA Scan History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review automated real-browser test results, regression signals, and route coverage.
        </p>
      </div>

      {isLoading ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3">Target Application</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Routes Tested</TableHead>
              <TableHead>Failures</TableHead>
              <TableHead className="px-5 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-5 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-52" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <Skeleton className="h-8 w-20 ml-auto rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : !scans || scans.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-3">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No scans found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't run any browser scans yet. Start one from the Overview page.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button size="sm" variant="primary">
                  Go to Overview
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3">Target Application</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Routes Tested</TableHead>
              <TableHead>Failures</TableHead>
              <TableHead className="px-5 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-mono font-medium text-foreground truncate max-w-sm">
                      {scan.targetUrl}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                    {new Date(scan.createdAt).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      scan.status === "completed"
                        ? "healthy"
                        : scan.status === "failed"
                          ? "failed"
                          : scan.status === "cancelled"
                            ? "warning"
                            : "info"
                    }
                    dot
                  >
                    {scan.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {scan.status === "completed" ? (
                    <span
                      className={
                        (scan.healthScore || 0) >= 90
                          ? "text-emerald-400"
                          : (scan.healthScore || 0) >= 70
                            ? "text-amber-400"
                            : "text-rose-400"
                      }
                    >
                      {scan.healthScore}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {scan.testedRoutes} / {scan.totalRoutes}
                </TableCell>
                <TableCell>
                  {scan.failedRoutes > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-rose-400 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      {scan.failedRoutes} failed
                    </span>
                  ) : scan.warningRoutes > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {scan.warningRoutes} warnings
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clean
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <Link href={`/dashboard/scans/${scan.id}`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Report
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
