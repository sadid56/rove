<div align="center">

# 🛰️ ROVE

**Automated Production QA & Real-Browser Web Intelligence Platform**

</div>

---

## 📖 Overview

**ROVE** is a production QA platform designed to eliminate manual smoke-testing after deployments. Instead of clicking through hundreds of routes or assuming that HTTP `200 OK` means your application works, **Rove** automatically crawls routes, inspects real client runtime execution in headless Chromium, intercepts broken background APIs, flags React hydration errors, and monitors deployment-to-deployment regressions.

---

## ✨ Key Features

- **🌐 Autonomous Route Discovery:** Automatically parses `sitemap.xml`, `robots.txt`, and deep-crawls internal DOM links without manual route configuration.
- **⚡ Real Browser Execution (Playwright):** Runs genuine Chromium instances to catch client-side JavaScript crashes, unhandled promise rejections, and React hydration mismatches.
- **📡 Network & Asset Telemetry:** Differentiates page status from broken background API calls. Flags 404 missing stylesheets, broken scripts, failed fonts, and 5xx AJAX requests.
- **🔄 Regression Detection:** Compares previous deployment scans against the latest run to pinpoint exact routes that degraded in performance or threw new errors.
- **🔒 End-to-End Type Safety:** Strict contracts across frontend, API, and worker using **oRPC**, **Zod**, and **Drizzle ORM**.
- **🎨 Modern Design System (`@repo/ui`):** Dark mode first, fluid glassmorphism interface powered by semantic tokens defined in `globals.css` with zero arbitrary hardcoded colors.

---

## 🏗️ Monorepo Architecture

This project is organized as a high-performance monorepo powered by **Turborepo** and **pnpm**:

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js:** `>= 22.0.0`
- **pnpm:** `>= 11.0.0`
- **PostgreSQL Database:** Supabase or local Postgres connection URI

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/sadid56/rove.git
cd rove

# Install all workspace dependencies
pnpm install
```

### 3. Environment Configuration

Copy the example environment files and configure your credentials:

```bash
# API Environment
cp apps/api/.env.example apps/api/.env

# Worker Environment
cp apps/worker/.env.example apps/worker/.env

# Web Environment
cp apps/web/.env.example apps/web/.env.local
```

Key environment variables to configure:
- `DATABASE_URL`: Supabase / PostgreSQL connection pooler string
- `BETTER_AUTH_SECRET`: Secret key for session encryption
- `FASTIFY_PORT`: Port for API gateway (default: `4000`)
- `NEXT_PUBLIC_API_URL`: Web client API endpoint (default: `http://localhost:4000`)

### 4. Database Setup

Push the Drizzle ORM schema to your database:

```bash
pnpm --filter @repo/database db:push
```

### 5. Run Development Servers

Start all applications (`web`, `api`, `worker`) concurrently:

```bash
pnpm dev
```

The services will be available at:
- **Web App / Dashboard:** `http://localhost:3000`
- **API Gateway:** `http://localhost:4000`
- **API Documentation:** `http://localhost:4000/docs`

---

## 🛠️ Available Scripts

Run these commands from the root directory:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts all applications in concurrent watch mode |
| `pnpm build` | Builds all apps and packages with Turborepo caching |
| `pnpm check-types` | Verifies TypeScript types across all workspaces (`tsc --noEmit`) |
| `pnpm lint` | Runs ESLint across all projects |
| `pnpm format` | Formats code with Prettier |
| `pnpm clean` | Completely cleans all build artifacts, caches, and `node_modules` across the monorepo |
| `pnpm clean:cache` | Cleans `.next`, `.turbo`, `dist`, `build`, `.cache`, and `tsbuildinfo` (preserves `node_modules`) |

### Targeting Specific Workspaces

```bash
# Run only web app
pnpm --filter web dev

# Run only API gateway
pnpm --filter api dev

# Run only Worker crawler
pnpm --filter worker dev

# Typecheck only web
pnpm --filter web check-types
```

---

## 🧹 Cache & Dependency Management

```bash
# Full clean: removes all outputs, caches + node_modules for a completely fresh install
pnpm clean
pnpm install

# Fast clean: removes only build outputs & caches without deleting node_modules
pnpm clean:cache
```

---

## 🛡️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TanStack Query, React Hook Form, Zod, Sonner |
| **Styling** | Tailwind CSS v4, Semantic CSS Tokens (`@repo/ui/globals.css`) |
| **API Framework** | Fastify 5, oRPC, `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit` |
| **Browser Engine** | Playwright (Headless Chromium), internal spider crawler, sitemap parser |
| **Auth** | Better Auth (Email/Password, Session Tokens, Secure Cookies) |
| **Database** | Supabase PostgreSQL, Drizzle ORM, Drizzle Kit |
| **Monorepo Tools** | Turborepo, pnpm workspaces, TypeScript 7 |

---

## 📄 License

Private & Proprietary. All rights reserved by **Rove Platform**.
