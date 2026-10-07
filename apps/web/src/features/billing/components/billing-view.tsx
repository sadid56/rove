"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { CreditCard, Check, Download, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Skeleton,
  DataTable,
  type ColumnDef,
} from "@repo/ui";
import {
  useBilling,
  useBillingInvoices,
  useCreateCheckoutSession,
  useCreatePortalSession,
  type InvoiceItem,
} from "@/react-query/qa-suites/actions";
import { PageHeader } from "@/components/common";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  popular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter QA",
    description: "Ideal for solo developers and personal open-source repositories.",
    priceMonthly: 19,
    priceAnnual: 15,
    features: [
      "100 automated scans per month",
      "Up to 2 concurrent headless browsers",
      "Full page screenshots & console logs",
      "Basic health score & regression checks",
      "Community Discord support",
    ],
  },
  {
    id: "pro",
    name: "Pro Intelligence",
    description: "Built for scaling engineering teams and production SaaS applications.",
    priceMonthly: 49,
    priceAnnual: 39,
    popular: true,
    features: [
      "1,000 automated scans per month",
      "5 concurrent Playwright browser runners",
      "Multimodal Gemini Vision UI audit",
      "One-click AI code patch & GitHub PRs",
      "Autonomous User Journey fuzzing",
      "Slack & Discord webhook notifications",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Sentinel",
    description: "For high-traffic platforms needing custom concurrency and SOC2 compliance.",
    priceMonthly: 199,
    priceAnnual: 159,
    features: [
      "Unlimited automated browser scans",
      "25+ dedicated concurrent cloud browsers",
      "Self-healing test locator engine",
      "OWASP security & secret leak scanner",
      "GitHub PR Gatekeeper with merge blocking",
      "SLA 99.9% uptime & dedicated account engineer",
    ],
  },
];

export function BillingView() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));

  const { data: billing, isLoading } = useBilling();
  const { data: invoicesResponse, isLoading: isInvoicesLoading } = useBillingInvoices({ page, pageSize });
  const checkoutMutation = useCreateCheckoutSession();
  const portalMutation = useCreatePortalSession();

  const invoices = invoicesResponse?.items || [];
  const totalCount = invoicesResponse?.totalCount || 0;
  const totalPages = invoicesResponse?.totalPages || 1;

  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const isCanceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const activePlanId = billing?.planId || "pro";

  const invoiceColumns: ColumnDef<InvoiceItem>[] = [
    {
      header: "Invoice Key",
      accessorKey: "id",
      cell: ({ value }) => <span className='font-mono text-xs text-foreground font-semibold'>{value}</span>,
    },
    {
      header: "Billing Date",
      accessorKey: "date",
      cell: ({ value }) => <span className='text-xs text-muted-foreground'>{value}</span>,
    },
    {
      header: "Plan Tier",
      accessorKey: "plan",
      cell: ({ value }) => <span className='text-xs text-foreground'>{value}</span>,
    },
    {
      header: "Amount Paid",
      accessorKey: "amount",
      cell: ({ value }) => <span className='text-xs text-foreground font-semibold'>{value}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ value }) => (
        <Badge variant='healthy' className='text-[10px] uppercase'>
          {value}
        </Badge>
      ),
    },
    {
      header: "Receipt",
      align: "right",
      cell: () => (
        <div className='flex justify-end'>
          <Button variant='ghost' size='sm' className='h-7 text-xs' leftIcon={<Download className='w-3 h-3' />}>
            PDF
          </Button>
        </div>
      ),
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
    try {
      const res = await checkoutMutation.mutateAsync({
        planId,
        billingCycle,
      });

      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate Stripe checkout");
    } finally {
      setSelectedPlanId(null);
    }
  };

  const handleManagePortal = async () => {
    try {
      const res = await portalMutation.mutateAsync({});
      if (res?.portalUrl) {
        window.location.href = res.portalUrl;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to open Stripe customer portal");
    }
  };

  return (
    <div className='space-y-8 w-full'>
      <PageHeader
        title='Subscription & Stripe Billing'
        description='Manage your subscription tier, browser concurrency quotas, and Stripe customer portal.'
        icon={<CreditCard className='w-6 h-6 text-primary' />}
        actions={
          <Button
            variant='outline'
            size='sm'
            isLoading={portalMutation.isPending}
            onClick={handleManagePortal}
            leftIcon={<ExternalLink className='w-3.5 h-3.5' />}
          >
            Customer Portal
          </Button>
        }
      />

      {isSuccess && (
        <div className='p-4 rounded-xl bg-success/15 border border-success/30 text-success flex items-center justify-between animate-in fade-in'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0'>
              <Check className='w-4 h-4 text-success' />
            </div>
            <div>
              <p className='text-sm font-semibold'>Stripe Checkout Completed!</p>
              <p className='text-xs text-success/90'>
                Your payment was processed successfully. Your subscription quota and concurrency are now active.
              </p>
            </div>
          </div>
          {sessionId && <span className='font-mono text-[10px] bg-success/20 px-2 py-1 rounded'>Ref: {sessionId.slice(0, 16)}...</span>}
        </div>
      )}

      {isCanceled && (
        <div className='p-4 rounded-xl bg-warning/15 border border-warning/30 text-warning flex items-center gap-3 animate-in fade-in'>
          <AlertCircle className='w-5 h-5 shrink-0' />
          <div>
            <p className='text-sm font-semibold'>Checkout Canceled</p>
            <p className='text-xs text-warning/90'>
              The Stripe checkout session was canceled. No charges were made to your payment method.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
          <Skeleton className='h-40 rounded-xl' />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='p-5 flex flex-col justify-between'>
            <div className='space-y-1'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>Active Subscription</span>
              <div className='flex items-center gap-2 mt-1'>
                <h3 className='text-xl font-bold text-foreground'>
                  {PLANS.find((p) => p.id === activePlanId)?.name || "Pro Intelligence"}
                </h3>
                <Badge variant='healthy' className='text-[10px]'>
                  ACTIVE
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>Renews automatically on {billing?.renewsAt || "Next billing date"}</p>
            </div>
            <div className='mt-4 pt-4 border-t border-border flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Payment Method</span>
              <span className='font-medium text-foreground'>{billing?.paymentMethod || "Visa ending in 4242"}</span>
            </div>
          </Card>

          <Card className='p-5 flex flex-col justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Monthly Browser Scans</span>
                <span className='font-semibold text-foreground'>
                  {billing?.scansUsed || 0} / {billing?.scansLimit || 1000}
                </span>
              </div>
              <div className='w-full bg-secondary h-2 rounded-full overflow-hidden'>
                <div
                  className='bg-primary h-full transition-all'
                  style={{
                    width: `${Math.min(100, ((billing?.scansUsed || 0) / (billing?.scansLimit || 1000)) * 100)}%`,
                  }}
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>
                {Math.max(0, (billing?.scansLimit || 1000) - (billing?.scansUsed || 0))} scans remaining.
              </p>
            </div>
            <div className='mt-4 pt-4 border-t border-border flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Concurrency Quota</span>
              <span className='font-medium text-foreground'>{billing?.concurrencyLimit || 5} Parallel Cloud Browsers</span>
            </div>
          </Card>

          <Card className='p-5 flex flex-col justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>AI Intelligence Tokens</span>
                <span className='font-semibold text-foreground'>
                  {Math.round((billing?.aiTokensUsed || 0) / 1000)}k / {Math.round((billing?.aiTokensLimit || 200000) / 1000)}k
                </span>
              </div>
              <div className='w-full bg-secondary h-2 rounded-full overflow-hidden'>
                <div
                  className='bg-primary h-full transition-all'
                  style={{
                    width: `${Math.min(100, ((billing?.aiTokensUsed || 0) / (billing?.aiTokensLimit || 200000)) * 100)}%`,
                  }}
                />
              </div>
              <p className='text-[11px] text-muted-foreground'>Gemini 2.5 Pro Vision & AI Patch generation.</p>
            </div>
            <div className='mt-4 pt-4 border-t border-border flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Self-Healing Engine</span>
              <span className='font-medium text-success'>Unlimited (Included)</span>
            </div>
          </Card>
        </div>
      )}

      <div className='text-center space-y-4 pt-4'>
        <h2 className='text-xl font-bold text-foreground'>Upgrade with Stripe Hosted Checkout</h2>
        <div className='inline-flex items-center p-1 rounded-xl bg-secondary border border-border'>
          <button
            type='button'
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              billingCycle === "monthly" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type='button'
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Annual Billing</span>
            <span className='text-[10px] px-1.5 py-0.2 rounded-full bg-success/20 text-success uppercase'>Save 20%</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {PLANS.map((plan) => {
          const isCurrent = activePlanId === plan.id;
          const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
          const isTargetLoading = checkoutMutation.isPending && selectedPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between relative transition-all ${
                plan.popular ? "border-primary shadow-lg shadow-primary/5" : ""
              }`}
            >
              {plan.popular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm'>
                  Most Popular
                </div>
              )}

              <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-bold'>{plan.name}</CardTitle>
                <CardDescription className='text-xs min-h-8'>{plan.description}</CardDescription>
                <div className='mt-4 flex items-baseline gap-1'>
                  <span className='text-3xl font-extrabold text-foreground'>${price}</span>
                  <span className='text-xs text-muted-foreground'>/ month</span>
                </div>
              </CardHeader>

              <CardContent className='space-y-3 pt-2 flex-1'>
                <div className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Included Features:</div>
                <div className='space-y-2'>
                  {plan.features.map((f, idx) => (
                    <div key={idx} className='flex items-start gap-2 text-xs text-muted-foreground'>
                      <Check className='w-3.5 h-3.5 text-primary shrink-0 mt-0.5' />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className='pt-4 border-t border-border'>
                <Button
                  variant={isCurrent ? "outline" : "primary"}
                  className='w-full text-xs'
                  disabled={isCurrent}
                  isLoading={isTargetLoading}
                  onClick={() => handleSelectPlan(plan.id)}
                  leftIcon={!isCurrent ? <ShieldCheck className='w-3.5 h-3.5' /> : undefined}
                >
                  {isCurrent ? "Current Active Plan" : "Checkout via Stripe"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>Billing History & Receipts</CardTitle>
          <CardDescription className='text-xs'>Download your monthly invoices for tax and accounting records.</CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            isLoading={isInvoicesLoading && !invoicesResponse}
            loadingRowCount={5}
            pagination={true}
            manualPagination={true}
            page={page - 1}
            pageSize={pageSize}
            totalCount={totalCount}
            pageCount={totalPages}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={(zeroBasedPage) => setPage(zeroBasedPage + 1)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            emptyMessage='No billing receipts found.'
          />
        </CardContent>
      </Card>
    </div>
  );
}
