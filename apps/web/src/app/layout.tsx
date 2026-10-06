import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import "@repo/ui/globals.css";

import { getAppUrl } from "@/lib/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = getAppUrl();

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rove | Autonomous Production QA & Web Intelligence",
    template: "%s | Rove",
  },
  description:
    "Deploy it. Rove checks it. Automated browser-based QA, route discovery, hydration crash detection, session video recordings, and AI-powered root-cause code fixes for modern web applications.",
  applicationName: "Rove",
  authors: [{ name: "Rove Team", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "automated QA",
    "browser testing",
    "playwright automation",
    "synthetic monitoring",
    "regression testing",
    "hydration error detector",
    "web crawler QA",
    "AI root cause analysis",
    "autonomous web QA",
    "production quality assurance",
    "headless chromium testing",
  ],
  creator: "Rove",
  publisher: "Rove",
  category: "Developer Tools",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Rove",
    title: "Rove | Autonomous Production QA & Web Intelligence",
    description: "Automated browser-based QA, route discovery, hydration crash detection, session videos, and AI root-cause code patches.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rove - Autonomous Production QA & Web Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rove | Autonomous Production QA & Web Intelligence",
    description: "Automated browser-based QA, route discovery, hydration crash detection, session videos, and AI root-cause code patches.",
    creator: "@roveqa",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Rove",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "Automated browser-based QA, route discovery, hydration crash detection, session video recording, and AI-powered root-cause code fixes for web applications.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Autonomous Route Discovery & Sitemap Crawling",
        "Headless Chromium QA Automation with Playwright",
        "React Hydration Error & Uncaught Exception Triage",
        "Network 4xx/5xx API Failure Observation",
        "Session Video & Headless Screenshot Capturing",
        "Google Gemini Autonomous AI Root-Cause Code Patches",
        "Regression Detection Against Historical Baselines",
      ],
    },
    {
      "@type": "Organization",
      name: "Rove",
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      sameAs: ["https://github.com/sadid56/rove"],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} antialiased`}>
      <head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <QueryProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors position='top-right' theme='dark' />
        </QueryProvider>
      </body>
    </html>
  );
}
