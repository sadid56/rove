"use client";

import React, { useState } from "react";
import { Route, Play, Plus, CheckCircle2, Clock, Sparkles, Layers } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Modal, Input, Label, Skeleton } from "@repo/ui";
import { useJourneys, useCreateJourney, useRunJourney } from "@/react-query/qa-suites/actions";

import { PageHeader } from "@/components/common";

export function JourneysView() {
  const { data: journeys = [], isLoading } = useJourneys();
  const createJourney = useCreateJourney();
  const runJourney = useRunJourney();

  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");

  const activeJourney = journeys.find((j) => j.id === selectedJourneyId) || journeys[0] || null;

  const handleRunJourney = async (id: string) => {
    await runJourney.mutateAsync({ id });
  };

  const handleCreateJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await createJourney.mutateAsync({
      name: newTitle.trim(),
      description: newPrompt.trim() || undefined,
      prompt: newPrompt.trim() || undefined,
    });

    if (res && res.id) {
      setSelectedJourneyId(res.id);
    }
    setNewTitle("");
    setNewPrompt("");
    setIsModalOpen(false);
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title="Autonomous User Journeys"
        description="End-to-end multi-step flows with self-healing locators and automated assertion validation."
        icon={<Route className="w-6 h-6 text-primary" />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            New Journey
          </Button>
        }
      />

      {isLoading ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='space-y-3'>
            <Skeleton className='h-28 w-full rounded-xl' />
            <Skeleton className='h-28 w-full rounded-xl' />
          </div>
          <div className='lg:col-span-2'>
            <Skeleton className='h-80 w-full rounded-xl' />
          </div>
        </div>
      ) : journeys.length === 0 ? (
        <Card className='p-8 text-center space-y-3'>
          <Route className='w-10 h-10 text-muted-foreground/60 mx-auto' />
          <h3 className='text-base font-semibold text-foreground'>No User Journeys Configured</h3>
          <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
            Create your first autonomous scenario using plain-English prompts or sequence action steps.
          </p>
          <Button variant='primary' size='sm' onClick={() => setIsModalOpen(true)}>
            Create Scenario
          </Button>
        </Card>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1 space-y-3'>
            <div className='text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1'>
              Configured Scenarios ({journeys.length})
            </div>

            {journeys.map((j) => {
              const isSelected = activeJourney?.id === j.id;
              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedJourneyId(j.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? "bg-secondary/70 border-primary/50 shadow-xs" : "bg-card border-border hover:bg-secondary/40"
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-foreground line-clamp-1'>{j.name}</h3>
                    <Badge variant={j.status === "passed" ? "healthy" : "failed"} className='shrink-0 text-[10px]'>
                      {j.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>{j.description || "Autonomous user flow."}</p>

                  <div className='flex items-center justify-between mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground'>
                    <div className='flex items-center gap-3'>
                      <span className='flex items-center gap-1'>
                        <Layers className='w-3 h-3' />
                        {j.stepsCount} steps
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {j.duration || "0s"}
                      </span>
                    </div>

                    {j.selfHealed && (
                      <Badge variant='warning' className='text-[9px] px-1.5 py-0 h-4'>
                        Self-Healed
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='lg:col-span-2'>
            {activeJourney ? (
              <Card className='h-full flex flex-col'>
                <CardHeader className='flex flex-row items-start justify-between pb-4 border-b border-border'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <CardTitle className='text-lg'>{activeJourney.name}</CardTitle>
                      {activeJourney.selfHealed && (
                        <Badge variant='warning' className='text-[10px]'>
                          <Sparkles className='w-3 h-3 mr-1' />
                          AI Healed
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{activeJourney.description}</CardDescription>
                  </div>

                  <Button
                    variant='primary'
                    size='sm'
                    isLoading={runJourney.isPending}
                    onClick={() => handleRunJourney(activeJourney.id)}
                    leftIcon={<Play className='w-4 h-4' />}
                  >
                    Execute Flow
                  </Button>
                </CardHeader>

                <CardContent className='pt-6 space-y-4 flex-1'>
                  <div className='flex items-center justify-between text-xs text-muted-foreground pb-2'>
                    <span>Sequential Journey Execution Timeline</span>
                    <span>Last run: {activeJourney.lastRun || "Never"}</span>
                  </div>

                  <div className='space-y-3'>
                    {(activeJourney.steps || []).map((s, idx) => (
                      <div key={idx} className='flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30'>
                        <div className='flex items-center gap-3'>
                          <div className='w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0'>
                            {s.step || idx + 1}
                          </div>
                          <div>
                            <div className='text-xs font-semibold text-foreground flex items-center gap-2'>
                              <span>{s.action}</span>
                              <code className='text-[11px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground'>
                                {s.target}
                              </code>
                            </div>
                          </div>
                        </div>

                        <Badge variant='healthy' className='text-[10px]'>
                          <CheckCircle2 className='w-3 h-3 mr-1' />
                          Passed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Create Autonomous User Journey'
        description='Describe the flow in plain English or define step parameters. ROVE will convert it into a resilient headless browser journey.'
      >
        <form onSubmit={handleCreateJourney} className='space-y-4 pt-2'>
          <Input
            label='Journey Name'
            placeholder='e.g. Add to Cart and Checkout'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className='space-y-1.5'>
            <Label htmlFor='journey-instructions'>Plain-English Instructions</Label>
            <textarea
              id='journey-instructions'
              className='w-full h-24 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50'
              placeholder="e.g. Navigate to /pricing, click 'Get Started' button, fill email with test@example.com, and verify confirmation."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
          </div>

          <div className='flex items-center justify-end gap-2 pt-3 border-t border-border'>
            <Button type='button' variant='outline' size='sm' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              isLoading={createJourney.isPending}
              leftIcon={<Sparkles className='w-4 h-4' />}
            >
              Generate & Save Journey
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
