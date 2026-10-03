import React from "react";
import Link from "next/link";
import { ArrowRight, Globe, Activity, Cpu, Flame, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button, Card, CardContent, Badge, RoveLogo } from "@repo/ui";

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary'>
      <header className='border-b border-border/80 sticky top-0 z-40 bg-background/80 backdrop-blur-md'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link href='/'>
            <RoveLogo size='md' withContainer={true} subtitle={false} />
          </Link>

          <nav className='hidden md:flex items-center gap-6 text-sm text-muted-foreground'>
            <a href='#features' className='hover:text-foreground transition-colors'>
              Features
            </a>
            <a href='#workflow' className='hover:text-foreground transition-colors'>
              Workflow
            </a>
            <a
              href='http://localhost:4000/docs'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground transition-colors flex items-center gap-1'
            >
              API Docs <ExternalLink className='w-3.5 h-3.5' />
            </a>
          </nav>

          <div className='flex items-center gap-3'>
            <Link href='/login'>
              <Button variant='ghost' size='sm'>
                Sign In
              </Button>
            </Link>
            <Link href='/dashboard'>
              <Button variant='primary' size='sm' rightIcon={<ArrowRight className='w-3.5 h-3.5' />}>
                Launch Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <section className='py-20 md:py-28 px-6 max-w-5xl mx-auto text-center space-y-6'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-muted-foreground'>
            <span className='w-2 h-2 rounded-full bg-success animate-pulse' />
            Automated Production QA & Web Intelligence
          </div>

          <h1 className='text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]'>
            Deploy it. <span className='text-primary'>Rove checks it.</span>
          </h1>

          <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            Instead of manually clicking hundreds of pages after deployment, Rove automatically discovers routes, tests them in real
            headless Chromium, observes console errors, catches 5xx APIs, and flags regressions.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-3 pt-4'>
            <Link href='/dashboard' className='w-full sm:w-auto'>
              <Button size='lg' variant='primary' className='w-full sm:w-auto' rightIcon={<ArrowRight className='w-4 h-4' />}>
                Go to Workspace Dashboard
              </Button>
            </Link>
            <Link href='/register' className='w-full sm:w-auto'>
              <Button size='lg' variant='outline' className='w-full sm:w-auto'>
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>

        <section className='px-6 max-w-6xl mx-auto pb-20'>
          <div className='rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4'>
            <div className='flex items-center justify-between border-b border-border pb-4'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span className='w-3 h-3 rounded-full bg-destructive/80 inline-block' />
                <span className='w-3 h-3 rounded-full bg-warning/80 inline-block' />
                <span className='w-3 h-3 rounded-full bg-success/80 inline-block' />
                <span className='ml-2 text-foreground font-semibold'>rove scan https://example.com</span>
              </div>
              <Badge variant='healthy' dot>
                SCAN COMPLETE (100% COVERAGE)
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-2'>
              <div className='p-4 rounded-xl bg-secondary/30 border border-border space-y-1'>
                <span className='text-xs text-muted-foreground'>PAGES DISCOVERED</span>
                <p className='text-2xl font-bold text-foreground'>247 routes</p>
                <span className='text-[11px] text-muted-foreground'>Crawled via sitemap + internal spider</span>
              </div>
              <div className='p-4 rounded-xl bg-secondary/30 border border-border space-y-1'>
                <span className='text-xs text-muted-foreground'>HEALTH SCORE</span>
                <p className='text-2xl font-bold text-success'>96.8% Clean</p>
                <span className='text-[11px] text-muted-foreground'>239 healthy, 8 investigated</span>
              </div>
              <div className='p-4 rounded-xl bg-secondary/30 border border-border space-y-1'>
                <span className='text-xs text-muted-foreground'>DEPLOYMENT REGRESSIONS</span>
                <p className='text-2xl font-bold text-warning'>2 changes</p>
                <span className='text-[11px] text-muted-foreground'>1 new 500 error, 1 resolved bug</span>
              </div>
            </div>

            <div className='rounded-xl border border-border/80 bg-background/60 p-4 text-xs space-y-2'>
              <div className='flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2'>
                <span>EXPLORED ROUTE</span>
                <span>OBSERVED TELEMETRY</span>
              </div>
              <div className='flex items-center justify-between text-success'>
                <span className='flex items-center gap-1.5 truncate'>
                  <CheckCircle2 className='w-3.5 h-3.5 shrink-0' /> /products/electronics-101
                </span>
                <span>200 OK • 420ms • 0 console errors</span>
              </div>
              <div className='flex items-center justify-between text-destructive'>
                <span className='flex items-center gap-1.5 truncate'>
                  <XCircle className='w-3.5 h-3.5 shrink-0' /> /checkout/cart
                </span>
                <span>API returned 500 (/api/tax-calculation) • Screenshot captured</span>
              </div>
              <div className='flex items-center justify-between text-success'>
                <span className='flex items-center gap-1.5 truncate'>
                  <CheckCircle2 className='w-3.5 h-3.5 shrink-0' /> /dashboard/analytics
                </span>
                <span>SSR Dynamic • 610ms • Clean</span>
              </div>
            </div>
          </div>
        </section>

        <section id='features' className='py-20 px-6 max-w-7xl mx-auto border-t border-border'>
          <div className='text-center space-y-3 mb-14'>
            <h2 className='text-3xl font-bold tracking-tight text-foreground'>Built for Modern Web Engineering</h2>
            <p className='text-sm text-muted-foreground max-w-xl mx-auto'>
              HTTP status 200 does not mean your page works. Rove observes real client execution.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='pt-6 space-y-3'>
                <div className='w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
                  <Globe className='w-5 h-5' />
                </div>
                <h3 className='font-semibold text-base'>Route Discovery</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Extracts routes automatically from sitemap.xml, robots.txt, and deeply traverses internal DOM links without manual URL
                  configuration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6 space-y-3'>
                <div className='w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
                  <Cpu className='w-5 h-5' />
                </div>
                <h3 className='font-semibold text-base'>Real Playwright Browser</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Executes JavaScript, captures React hydration failures, monitors unhandled promise rejections, and takes full-page
                  viewport screenshots.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6 space-y-3'>
                <div className='w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center'>
                  <Activity className='w-5 h-5' />
                </div>
                <h3 className='font-semibold text-base'>Network & Asset Health</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Differentiates between page loads and broken background APIs. Flags 404 broken stylesheets, missing JS chunks, and failed
                  fonts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6 space-y-3'>
                <div className='w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center'>
                  <Flame className='w-5 h-5' />
                </div>
                <h3 className='font-semibold text-base'>Deployment Regressions</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Compares current scan against previous deployment scans to identify exact routes that broke or suffered performance
                  degradations.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className='border-t border-border py-8 px-6 text-center text-xs text-muted-foreground'>
        <div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <RoveLogo size='sm' withContainer={true} subtitle={false} />
            <span>— Automated Production QA & Web Intelligence</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Rove Platform. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
