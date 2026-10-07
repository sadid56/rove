"use client";

import React, { useState } from "react";
import {
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Radio,
  Sliders,
  Check,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui";
import { PageHeader } from "@/components/common";

const GITHUB_ACTION_SNIPPET = `name: Rove QA Gatekeeper
on: [pull_request]

jobs:
  qa_gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Rove Deployment Scan
        uses: rove-dev/qa-action@v1
        with:
          api-key: \${{ secrets.ROVE_API_KEY }}
          target-url: \${{ steps.deploy.outputs.preview_url }}
          health-threshold: 90
          block-merge-on-failure: true`;

export function IntegrationsView() {
  const [copied, setCopied] = useState(false);
  const [connectedServices, setConnectedServices] = useState<Record<string, boolean>>({
    github: true,
    vercel: true,
    slack: false,
    jira: false,
  });

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(GITHUB_ACTION_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleService = (key: string) => {
    setConnectedServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="CI/CD Gatekeeper & Integrations"
        description="Automate browser regression testing on every GitHub Pull Request and stream live alerts to Slack or Discord."
        icon={<GitBranch className="w-6 h-6 text-primary" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">GitHub Actions PR Gatekeeper</CardTitle>
                  <CardDescription className="text-xs">
                    Blocks PR merges if health score falls below 90%
                  </CardDescription>
                </div>
              </div>
              <Badge variant={connectedServices.github ? "healthy" : "neutral"} className="text-[10px]">
                {connectedServices.github ? "CONNECTED" : "INACTIVE"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Add the Rove Action to your repository workflow to automatically evaluate preview builds and post QA comments directly on PRs.
            </p>
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-black/80 font-mono text-[11px] text-muted-foreground overflow-x-auto border border-border">
                {GITHUB_ACTION_SNIPPET}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySnippet}
                className="absolute top-2 right-2 text-xs h-7"
                leftIcon={<Copy className="w-3 h-3" />}
              >
                {copied ? "Copied" : "Copy YAML"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t border-border flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleService("github")}
            >
              {connectedServices.github ? "Disconnect Repo" : "Connect GitHub"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Vercel Deploy Hook</h4>
                <p className="text-xs text-muted-foreground">
                  Trigger instant browser scan upon preview deployment
                </p>
              </div>
            </div>
            <Button
              variant={connectedServices.vercel ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleService("vercel")}
            >
              {connectedServices.vercel ? "Enabled" : "Enable"}
            </Button>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-warning border border-border">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Slack & Discord Alerts</h4>
                <p className="text-xs text-muted-foreground">
                  Broadcast regression alerts and 5xx API crashes
                </p>
              </div>
            </div>
            <Button
              variant={connectedServices.slack ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleService("slack")}
            >
              {connectedServices.slack ? "Connected" : "Connect"}
            </Button>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Jira & Linear Auto-Sync</h4>
                <p className="text-xs text-muted-foreground">
                  Auto-create backlog issue tickets for high severity bugs
                </p>
              </div>
            </div>
            <Button
              variant={connectedServices.jira ? "primary" : "outline"}
              size="sm"
              onClick={() => toggleService("jira")}
            >
              {connectedServices.jira ? "Connected" : "Connect"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
