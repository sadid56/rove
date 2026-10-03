import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from "@repo/ui";

export function ScanSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3">Route Path</TableHead>
              <TableHead className="px-4 py-3">HTTP Status</TableHead>
              <TableHead className="px-4 py-3">Health</TableHead>
              <TableHead className="px-4 py-3">Rendering</TableHead>
              <TableHead className="px-4 py-3">Load Time</TableHead>
              <TableHead className="px-4 py-3">Issues</TableHead>
              <TableHead className="px-5 py-3 text-right">Inspect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-5 py-3.5">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-14" />
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                  <Skeleton className="h-8 w-24 ml-auto rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
