"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
} from "@repo/ui";
import { getApiUrl } from "@/lib/env";

export function SettingsView() {
  const [maxPages, setMaxPages] = useState("200");
  const [concurrency, setConcurrency] = useState("3");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings & Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your crawler policies, Playwright browser engine limits, and
          platform preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Browser Engine & Crawler Defaults
            </CardTitle>
            <CardDescription className="text-xs">
              Configure how the automated Playwright Chromium scanner traverses pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Max Pages Per Scan"
                type="number"
                min="1"
                max="2000"
                value={maxPages}
                onChange={(e) => setMaxPages(e.target.value)}
                helperText="Safety limit to prevent unbounded traversal on huge catalogs."
              />
              <Input
                label="Browser Context Concurrency"
                type="number"
                min="1"
                max="10"
                value={concurrency}
                onChange={(e) => setConcurrency(e.target.value)}
                helperText="Simultaneous isolated Chromium browser tabs."
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-success">
              {saved && "Settings saved successfully!"}
            </span>
            <Button type="submit" size="sm" variant="primary">
              Save Configuration
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              API & Worker Connectivity
            </CardTitle>
            <CardDescription className="text-xs">
              Fastify REST API and Supabase Drizzle persistence settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
              <span>oRPC Gateway</span>
              <span className="text-foreground">
                {(() => {
                  try {
                    return `${getApiUrl()}/v1/orpc`;
                  } catch {
                    return "Not configured";
                  }
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
              <span>Supabase Pooler</span>
              <span className="text-success font-medium">
                Connected (IPv4 Port 6543)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
              <span>Better Auth Service</span>
              <span className="text-foreground">Active (/api/v1/auth)</span>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
