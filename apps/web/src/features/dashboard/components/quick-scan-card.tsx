"use client";

import React from "react";
import { Globe, Play } from "lucide-react";
import { Card, CardContent, Button, Input } from "@repo/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTriggerScan } from "@/react-query/scans/actions";
import { useRouter } from "next/navigation";

const quickScanFormSchema = z.object({
  quickUrl: z.string().url("Must be a valid URL (e.g. https://example.com)"),
});

export type QuickScanFormValues = z.infer<typeof quickScanFormSchema>;

export function QuickScanCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickScanFormValues>({
    resolver: zodResolver(quickScanFormSchema),
    defaultValues: {
      quickUrl: "",
    },
  });
  const triggerScan = useTriggerScan();
  const router = useRouter();

  const handleQuickScan = async (targetUrl: string) => {
    try {
      const res = await triggerScan.mutateAsync({ targetUrl });
      if (res?.id) {
        router.push(`/dashboard/scans/${res.id}`);
      }
    } catch {
      // Handled by query mutation feedback
    }
  };

  const onSubmit = async (data: QuickScanFormValues) => {
    await handleQuickScan(data.quickUrl.trim());
    reset();
  };

  return (
    <Card className='border-primary/20 bg-linear-to-r from-card via-card to-primary/5'>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col md:flex-row gap-3 items-start'>
          <div className='flex-1 w-full'>
            <Input
              placeholder='https://your-production-app.com'
              leftIcon={<Globe className='w-4 h-4' />}
              error={errors.quickUrl?.message}
              {...register("quickUrl")}
            />
          </div>
          <Button
            type='submit'
            variant='primary'
            isLoading={triggerScan?.isPending}
            leftIcon={<Play className='w-4 h-4' />}
            className='shrink-0'
          >
            Run Instant Scan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
