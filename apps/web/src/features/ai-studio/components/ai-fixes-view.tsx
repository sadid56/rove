"use client";

import React, { useState } from "react";
import { Wrench, GitPullRequest, Check, Sparkles, Code2, Copy } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Modal, Skeleton } from "@repo/ui";
import { useAiFixes, useCreateFixPr } from "@/react-query/qa-suites/actions";
import { PageHeader } from "@/components/common";

export function AiFixesView() {
  const { data: fixes = [], isLoading } = useAiFixes();
  const createPrMutation = useCreateFixPr();

  const [selectedFixId, setSelectedFixId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFix = fixes.find((f) => f.id === selectedFixId) || fixes[0];

  const handleCreatePr = async () => {
    if (!selectedFix) return;
    await createPrMutation.mutateAsync({ id: selectedFix.id });
    setIsModalOpen(false);
  };

  const handleCopyDiff = () => {
    if (!selectedFix) return;
    const text = [...selectedFix.diff.before, ...selectedFix.diff.after].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='AI Fix & Auto-PR Generator'
        description='Multimodal code intelligence synthesizes ready-to-merge patches for hydration mismatches, unhandled rejections, and runtime exceptions.'
        icon={<Wrench className='w-6 h-6 text-primary' />}
        actions={
          <Badge variant='healthy' className='px-3 py-1 text-xs'>
            {fixes.filter((f) => f.status === "pr_created").length} PRs Dispatched
          </Badge>
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
              <Sparkles className='w-4 h-4 text-primary' />
              Available Code Patches ({fixes.length})
            </h3>

            {fixes.map((fix) => {
              const isSelected = selectedFix?.id === fix.id;
              return (
                <div
                  key={fix.id}
                  onClick={() => setSelectedFixId(fix.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                    isSelected ? "bg-secondary border-primary/50 shadow-xs" : "bg-card border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <span className='font-mono text-[11px] text-muted-foreground truncate'>{fix.filePath}</span>
                    <Badge variant={fix.status === "pr_created" ? "healthy" : "warning"} className='text-[10px] uppercase'>
                      {fix.status === "pr_created" ? "PR Open" : "Ready"}
                    </Badge>
                  </div>
                  <p className='font-semibold text-foreground line-clamp-2'>{fix.title}</p>
                  <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1'>
                    <span>{fix.errorType}</span>
                    <span className='font-mono text-primary'>Line {fix.line}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='lg:col-span-2'>
            {selectedFix ? (
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <Badge variant='info' className='text-[10px] uppercase'>
                          {selectedFix.errorType}
                        </Badge>
                        <span className='text-xs font-mono text-muted-foreground'>
                          {selectedFix.filePath}:{selectedFix.line}
                        </span>
                      </div>
                      <CardTitle className='text-base font-semibold'>{selectedFix.title}</CardTitle>
                    </div>

                    <div className='flex items-center gap-2 shrink-0'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleCopyDiff}
                        leftIcon={copied ? <Check className='w-3.5 h-3.5 text-success' /> : <Copy className='w-3.5 h-3.5' />}
                      >
                        {copied ? "Copied" : "Copy Diff"}
                      </Button>

                      {selectedFix.status === "pr_created" ? (
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-success border-success/30 pointer-events-none'
                          leftIcon={<GitPullRequest className='w-3.5 h-3.5' />}
                        >
                          PR #42 Active
                        </Button>
                      ) : (
                        <Button
                          variant='primary'
                          size='sm'
                          onClick={() => setIsModalOpen(true)}
                          leftIcon={<GitPullRequest className='w-3.5 h-3.5' />}
                        >
                          Generate GitHub PR
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='p-3.5 rounded-xl bg-secondary/50 border border-border text-xs space-y-1'>
                    <span className='font-semibold text-foreground text-[11px] uppercase tracking-wider'>Root Cause Analysis</span>
                    <p className='text-muted-foreground leading-relaxed'>{selectedFix.rootCause}</p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-xs font-semibold text-foreground'>
                      <span className='flex items-center gap-1.5'>
                        <Code2 className='w-3.5 h-3.5 text-primary' />
                        Synthesized Unified Diff
                      </span>
                      <span className='font-mono text-[11px] text-muted-foreground'>unified-diff format</span>
                    </div>

                    <div className='rounded-xl border border-border bg-[#0d1117] p-4 font-mono text-xs overflow-x-auto space-y-1'>
                      {selectedFix.diff.before.map((line, idx) => (
                        <div key={`b-${idx}`} className='text-red-400 bg-red-950/40 px-2 py-0.5 rounded -mx-1'>
                          {line}
                        </div>
                      ))}
                      {selectedFix.diff.after.map((line, idx) => (
                        <div key={`a-${idx}`} className='text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded -mx-1'>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className='p-12 text-center text-xs text-muted-foreground'>No code fixes available.</Card>
            )}
          </div>
        </div>
      )}

      {selectedFix && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title='Create GitHub Pull Request'
          description='Rove Bot will branch from main, apply this AI code fix patch, and open a PR with passing checks.'
        >
          <div className='space-y-4 pt-2'>
            <div className='p-3 rounded-lg bg-secondary/60 border border-border text-xs space-y-1 font-mono'>
              <p className='text-muted-foreground'>
                Branch: <span className='text-foreground'>fix/qa-{selectedFix.id}</span>
              </p>
              <p className='text-muted-foreground'>
                Target: <span className='text-foreground'>main</span>
              </p>
              <p className='text-muted-foreground'>
                Title: <span className='text-foreground'>{selectedFix.title}</span>
              </p>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' size='sm' onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='primary'
                size='sm'
                isLoading={createPrMutation.isPending}
                onClick={handleCreatePr}
                leftIcon={<GitPullRequest className='w-4 h-4' />}
              >
                Confirm & Open PR
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
