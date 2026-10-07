"use client";

import React, { useState, useMemo } from "react";
import {
  GitBranch,
  GitPullRequest,
  Copy,
  MessageSquare,
  Radio,
  Sliders,
  Check,
  Send,
  Settings2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Modal, Input } from "@repo/ui";
import { PageHeader } from "@/components/common";
import { useIntegrations, useUpdateIntegration, useTestIntegration, type IntegrationItem } from "@/react-query/qa-suites/actions";

export function IntegrationsView() {
  const { data: integrations, isLoading, refetch, isRefetching } = useIntegrations();
  const updateMutation = useUpdateIntegration();
  const testMutation = useTestIntegration();

  const [copied, setCopied] = useState(false);
  const [editingService, setEditingService] = useState<IntegrationItem | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, any>>({});

  // Lookup map for fast access
  const serviceMap = useMemo(() => {
    const map: Record<string, IntegrationItem> = {};
    integrations?.forEach((item) => {
      map[item.serviceKey] = item;
    });
    return map;
  }, [integrations]);

  const githubItem = serviceMap.github;
  const vercelItem = serviceMap.vercel;
  const slackItem = serviceMap.slack;
  const jiraItem = serviceMap.jira;

  // Dynamic GitHub Actions YAML generated from actual integration config
  const githubSnippet = useMemo(() => {
    const threshold = githubItem?.config?.healthThreshold ?? 90;
    const blockMerge = githubItem?.config?.blockMergeOnFailure ?? true;

    return `name: Rove QA Gatekeeper
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
          target-url: \${{ steps.deploy.outputs.preview_url || 'https://staging.example.com' }}
          health-threshold: ${threshold}
          block-merge-on-failure: ${blockMerge}`;
  }, [githubItem]);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(githubSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (service: IntegrationItem) => {
    await updateMutation.mutateAsync({
      serviceKey: service.serviceKey,
      enabled: !service.enabled,
    });
  };

  const handleOpenConfig = (service: IntegrationItem) => {
    setEditingService(service);
    setConfigForm(service.config || {});
  };

  const handleSaveConfig = async () => {
    if (!editingService) return;
    await updateMutation.mutateAsync({
      serviceKey: editingService.serviceKey,
      config: configForm,
    });
    setEditingService(null);
  };

  const handleTestService = async (serviceKey: string) => {
    await testMutation.mutateAsync({ serviceKey });
  };

  return (
    <div className='space-y-6 w-full'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <PageHeader
          title='CI/CD Gatekeeper & Integrations'
          description='Automate browser regression testing on every GitHub Pull Request and stream live alerts to Slack or Discord.'
          icon={<GitBranch className='w-6 h-6 text-primary' />}
        />
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />}
        >
          {isRefetching ? "Refreshing..." : "Refresh Status"}
        </Button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse'>
          <div className='h-96 rounded-2xl bg-secondary/40 border border-border' />
          <div className='space-y-4'>
            <div className='h-28 rounded-2xl bg-secondary/40 border border-border' />
            <div className='h-28 rounded-2xl bg-secondary/40 border border-border' />
            <div className='h-28 rounded-2xl bg-secondary/40 border border-border' />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* GitHub Actions PR Gatekeeper (7 Cols) */}
          <div className='lg:col-span-7'>
            <Card className='h-full flex flex-col justify-between'>
              <div>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border'>
                        <GitPullRequest className='w-5 h-5 text-primary' />
                      </div>
                      <div>
                        <CardTitle className='text-base'>{githubItem?.name || "GitHub Actions PR Gatekeeper"}</CardTitle>
                        <CardDescription className='text-xs'>
                          {githubItem?.description || "Blocks PR merges if health score falls below threshold"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={githubItem?.enabled ? "healthy" : "neutral"}
                      className='text-[10px] tracking-wider uppercase font-semibold'
                    >
                      {githubItem?.enabled ? "CONNECTED" : "INACTIVE"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4 pt-2'>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    Add the Rove Action to your repository workflow to automatically evaluate preview builds and post QA comments directly
                    on PRs.
                  </p>

                  <div className='relative group'>
                    <pre className='p-3.5 rounded-xl bg-black/80 font-mono text-[11px] text-muted-foreground overflow-x-auto border border-border selection:bg-primary/20'>
                      {githubSnippet}
                    </pre>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCopySnippet}
                      className='absolute top-2.5 right-2.5 text-xs h-7 bg-background/80 backdrop-blur-md'
                      leftIcon={copied ? <Check className='w-3 h-3 text-emerald-400' /> : <Copy className='w-3 h-3' />}
                    >
                      {copied ? "Copied" : "Copy YAML"}
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 gap-3 pt-1 text-xs'>
                    <div className='p-2.5 rounded-lg bg-secondary/30 border border-border'>
                      <span className='text-muted-foreground block text-[11px]'>Pass Threshold</span>
                      <span className='font-semibold text-foreground text-sm'>
                        {githubItem?.config?.healthThreshold ?? 90}% Health Score
                      </span>
                    </div>
                    <div className='p-2.5 rounded-lg bg-secondary/30 border border-border'>
                      <span className='text-muted-foreground block text-[11px]'>Last PR Run</span>
                      <span className='font-semibold text-foreground text-sm truncate block'>
                        {githubItem?.lastTriggeredAt || "Never triggered"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className='pt-3 border-t border-border flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => githubItem && handleOpenConfig(githubItem)}
                  className='text-xs text-muted-foreground hover:text-foreground'
                  leftIcon={<Settings2 className='w-3.5 h-3.5' />}
                >
                  Configure Gatekeeper
                </Button>
                <Button
                  variant={githubItem?.enabled ? "outline" : "primary"}
                  size='sm'
                  disabled={updateMutation.isPending}
                  onClick={() => githubItem && handleToggle(githubItem)}
                >
                  {githubItem?.enabled ? "Disconnect Repo" : "Connect GitHub"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Third-Party Service Integrations (5 Cols) */}
          <div className='lg:col-span-5 space-y-4'>
            {/* Vercel Deploy Hook */}
            {vercelItem && (
              <Card className='p-4 flex flex-col gap-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border shrink-0'>
                      <Radio className='w-4 h-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-semibold text-foreground'>{vercelItem.name}</h4>
                      <p className='text-xs text-muted-foreground line-clamp-1'>{vercelItem.description}</p>
                    </div>
                  </div>
                  <Badge variant={vercelItem.enabled ? "healthy" : "neutral"} className='text-[10px]'>
                    {vercelItem.enabled ? "ACTIVE" : "DISABLED"}
                  </Badge>
                </div>

                {vercelItem.lastTriggeredAt && (
                  <div className='text-[11px] text-muted-foreground bg-secondary/20 px-2.5 py-1 rounded-md border border-border flex items-center gap-1.5'>
                    <CheckCircle2 className='w-3 h-3 text-emerald-400 shrink-0' />
                    <span className='truncate'>{vercelItem.lastTriggeredAt}</span>
                  </div>
                )}

                <div className='flex items-center justify-end gap-2 pt-1 border-t border-border/60'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs text-muted-foreground'
                    onClick={() => handleOpenConfig(vercelItem)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 text-xs'
                    disabled={testMutation.isPending}
                    onClick={() => handleTestService("vercel")}
                    leftIcon={<Send className='w-3 h-3' />}
                  >
                    Ping
                  </Button>
                  <Button
                    variant={vercelItem.enabled ? "primary" : "outline"}
                    size='sm'
                    className='h-7 text-xs'
                    disabled={updateMutation.isPending}
                    onClick={() => handleToggle(vercelItem)}
                  >
                    {vercelItem.enabled ? "Enabled" : "Enable"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Slack & Discord Alerts */}
            {slackItem && (
              <Card className='p-4 flex flex-col gap-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-warning border border-border shrink-0'>
                      <MessageSquare className='w-4 h-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-semibold text-foreground'>{slackItem.name}</h4>
                      <p className='text-xs text-muted-foreground line-clamp-1'>{slackItem.description}</p>
                    </div>
                  </div>
                  <Badge variant={slackItem.enabled ? "healthy" : "neutral"} className='text-[10px]'>
                    {slackItem.enabled ? "CONNECTED" : "INACTIVE"}
                  </Badge>
                </div>

                {slackItem.config?.channel && (
                  <div className='text-[11px] text-muted-foreground bg-secondary/20 px-2.5 py-1 rounded-md border border-border flex items-center justify-between'>
                    <span>Target Channel:</span>
                    <span className='font-mono text-foreground font-medium'>{slackItem.config.channel}</span>
                  </div>
                )}

                <div className='flex items-center justify-end gap-2 pt-1 border-t border-border/60'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs text-muted-foreground'
                    onClick={() => handleOpenConfig(slackItem)}
                  >
                    Settings
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 text-xs'
                    disabled={testMutation.isPending}
                    onClick={() => handleTestService("slack")}
                    leftIcon={<Send className='w-3 h-3' />}
                  >
                    Test Alert
                  </Button>
                  <Button
                    variant={slackItem.enabled ? "primary" : "outline"}
                    size='sm'
                    className='h-7 text-xs'
                    disabled={updateMutation.isPending}
                    onClick={() => handleToggle(slackItem)}
                  >
                    {slackItem.enabled ? "Connected" : "Connect"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Jira & Linear Auto-Sync */}
            {jiraItem && (
              <Card className='p-4 flex flex-col gap-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border shrink-0'>
                      <Sliders className='w-4 h-4' />
                    </div>
                    <div>
                      <h4 className='text-sm font-semibold text-foreground'>{jiraItem.name}</h4>
                      <p className='text-xs text-muted-foreground line-clamp-1'>{jiraItem.description}</p>
                    </div>
                  </div>
                  <Badge variant={jiraItem.enabled ? "healthy" : "neutral"} className='text-[10px]'>
                    {jiraItem.enabled ? "SYNCING" : "INACTIVE"}
                  </Badge>
                </div>

                <div className='flex items-center justify-end gap-2 pt-1 border-t border-border/60'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs text-muted-foreground'
                    onClick={() => handleOpenConfig(jiraItem)}
                  >
                    Configure
                  </Button>
                  <Button
                    variant={jiraItem.enabled ? "primary" : "outline"}
                    size='sm'
                    className='h-7 text-xs'
                    disabled={updateMutation.isPending}
                    onClick={() => handleToggle(jiraItem)}
                  >
                    {jiraItem.enabled ? "Connected" : "Connect"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <Modal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title={`Configure ${editingService?.name || "Integration"}`}
        description='Update webhook endpoints, threshold parameters, and notification channels.'
        footer={
          <div className='flex justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={() => setEditingService(null)}>
              Cancel
            </Button>
            <Button variant='primary' size='sm' disabled={updateMutation.isPending} onClick={handleSaveConfig}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        }
      >
        <div className='space-y-4 py-2'>
          {editingService?.serviceKey === "github" && (
            <>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>GitHub Repository</label>
                <Input
                  value={configForm.repoName || ""}
                  onChange={(e) => setConfigForm({ ...configForm, repoName: e.target.value })}
                  placeholder='e.g. organization/repo'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>Health Pass Threshold (%)</label>
                <Input
                  type='number'
                  min={50}
                  max={100}
                  value={configForm.healthThreshold ?? 90}
                  onChange={(e) => setConfigForm({ ...configForm, healthThreshold: Number(e.target.value) })}
                  placeholder='90'
                />
                <span className='text-[11px] text-muted-foreground'>
                  PRs failing to meet this browser health score will have merge checks blocked.
                </span>
              </div>
            </>
          )}

          {editingService?.serviceKey === "vercel" && (
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>Vercel Deploy Webhook URL</label>
              <Input
                value={configForm.webhookUrl || ""}
                onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
                placeholder='https://api.rove.dev/v1/webhooks/vercel'
              />
            </div>
          )}

          {editingService?.serviceKey === "slack" && (
            <>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>Slack Incoming Webhook URL</label>
                <Input
                  value={configForm.webhookUrl || ""}
                  onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
                  placeholder='https://hooks.slack.com/services/...'
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-foreground'>Target Channel</label>
                <Input
                  value={configForm.channel || ""}
                  onChange={(e) => setConfigForm({ ...configForm, channel: e.target.value })}
                  placeholder='#qa-alerts'
                />
              </div>
            </>
          )}

          {editingService?.serviceKey === "jira" && (
            <div className='space-y-1.5'>
              <label className='text-xs font-medium text-foreground'>Jira / Linear Project Key</label>
              <Input
                value={configForm.projectKey || ""}
                onChange={(e) => setConfigForm({ ...configForm, projectKey: e.target.value })}
                placeholder='QA'
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
