import React from "react";
import Link from "next/link";
import { ArrowLeft, Square } from "lucide-react";
import { Button, Badge } from "@repo/ui";
import type { ScanDetail } from "@/react-query/scans/actions";

interface ScanHeaderProps {
  scan: ScanDetail;
  isScanning: boolean;
  isCancelling: boolean;
  onStopScan: () => void;
}

export function ScanHeader({ scan, isScanning, isCancelling, onStopScan }: ScanHeaderProps) {
  const healthScore = scan.healthScore;
  const healthScoreColor = (healthScore || 0) >= 90 ? "text-success" : (healthScore || 0) >= 70 ? "text-warning" : "text-destructive";

  const badgeVariant =
    scan.status === "completed" ? "healthy" : scan.status === "failed" ? "failed" : scan.status === "cancelled" ? "warning" : "info";

  return (
    <>
      <div className='flex items-center justify-between'>
        <Link
          href='/dashboard'
          className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Scans
        </Link>
        {isScanning && (
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 text-xs text-primary'>
              <span className='w-2 h-2 rounded-full bg-primary animate-ping' />
              Scanner Active: {scan.status.toUpperCase()}
            </div>
            <Button
              size='sm'
              variant='destructive'
              onClick={onStopScan}
              disabled={isCancelling}
              leftIcon={<Square className='w-3.5 h-3.5 fill-current' />}
            >
              {isCancelling ? "Stopping..." : "Stop Scan"}
            </Button>
          </div>
        )}
      </div>

      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground truncate max-w-xl'>{scan.targetUrl}</h1>
            <Badge variant={badgeVariant}>{scan.status.toUpperCase()}</Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>Initiated on {new Date(scan.createdAt).toLocaleString()}</p>
        </div>

        <div className='flex items-center gap-4 bg-secondary/40 border border-border px-4 py-2.5 rounded-xl'>
          <div>
            <span className='text-[10px] uppercase text-muted-foreground block'>Health Score</span>
            <span className={`text-2xl font-bold ${healthScoreColor}`}>
              {healthScore !== null && healthScore !== undefined ? `${healthScore}%` : "—"}
            </span>
          </div>
          <div className='h-8 w-px bg-border' />
          <div>
            <span className='text-[10px] uppercase text-muted-foreground block'>Progress</span>
            <span className='text-sm font-semibold text-foreground'>
              {scan.testedRoutes} / {scan.totalRoutes} pages
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
