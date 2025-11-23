![Hero Placeholder](https://github.com/abdlrhmn0x7e/gear-verse/blob/main/gallery/header.jpg)

<p align="center"><em>A modern, full-stack e-commerce platform for gaming and tech gear.</em></p>

## Table of Contents

- [Why Gear Verse](#why-gear-verse)
- [Highlights](#highlights)
- [Screens & Flows](#screens--flows)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Layout](#project-layout)
- [Domain & Features](#domain--features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Observability](#observability)
- [Contributing](#contributing)

## Why Gear Verse

Gear Verse is a full-stack reference implementation that mirrors how a real commerce engineering team would structure a codebase. It enforces clear boundaries (presentation -> application -> data-access -> database), typed APIs, rigorous auth, file uploads, and observability from the start.

## Highlights

- Realistic commerce surface area: products, variants, categories, carts, inventory, orders, reviews, brands, SEO metadata, and admin workflows.
- Layered backend with TRPC + Drizzle + Postgres so transport logic never leaks into domain rules.
- Better Auth with anonymous-to-registered migration keeps carts, addresses, and orders in sync when a guest signs up.
- Presigned S3 uploads, media management, and polished admin UX for catalog/inventory operations.
- First-class observability via typed domain errors mapped to TRPC plus Sentry tracing.
- Modern frontend DX: Next.js App Router, React Server Components, Tailwind CSS 4, Radix UI, @tanstack/react-query, and zustand.

## Screens & Flows

| View                                                                                                   | Description                                                                      |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ![Storefront Placeholder](https://github.com/abdlrhmn0x7e/gear-verse/blob/main/gallery/landing.png)    | Landing page, product listing/detail, category pages, reviews, variant selection |
| ![Admin Dashboard Placeholder](https://github.com/abdlrhmn0x7e/gear-verse/blob/main/gallery/admin.png) | Catalog CRUD, orders, fulfillment queues, inventory adjustments, quick actions   |

## Architecture

- **Next.js App Router (`src/app`)** handles routing, layouts, and React Server Components.
- **TRPC layer (`src/server/api`)** exposes typed procedures that orchestrate application use-cases.
- **Application layer (`src/server/application`)** enforces business rules per bounded context (products, checkout, admin, etc.).
- **Data-access layer (`src/server/data-access`)** centralizes Drizzle ORM queries, pagination, and joins.
- **Database schema (`src/server/db/schema`)** models catalog, users, carts, orders, media, SEO, and supporting tables.

## Tech Stack

| Area               | Tools                                                         |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 16, React 19 (RSC + Client Components)                |
| Language           | TypeScript 5 (strict)                                         |
| Runtime & Package  | Node.js 20+, Bun (CI) or PNPM                                 |
| Styling            | Tailwind CSS 4, design tokens in `src/styles`                 |
| UI Primitives      | Radix + custom components under `src/components/ui`           |
| Data Fetching      | TRPC v11, `@tanstack/react-query`, server actions             |
| State              | `zustand` + feature stores under `src/stores`                 |
| Forms & Validation | `react-hook-form`, Zod schemas in `src/lib/schemas`           |
| Auth               | Better Auth + plugins (`src/server/auth.ts`)                  |
| Storage            | AWS S3 via presigned uploads (`src/lib/s3.ts`)                |
| ORM & DB           | Drizzle ORM + Postgres (`src/server/db`)                      |
| Observability      | Sentry (`src/sentry.*`, `src/instrumentation*.ts`)            |
| Tooling            | ESLint 9, Prettier + Tailwind plugin, TypeScript project refs |

## Project Layout

```
src/
  app/
    (public)/(landing)/     # Marketing hero, featured products, testimonials
    (public)/products/      # Product listing + detail pages (RSC + client islands)
    (public)/categories/    # Category landing + SEO
    admin/                  # Admin dashboard, CRUD flows, reports
    api/auth/               # Better Auth route handler
    api/trpc/               # TRPC handler
  components/               # UI primitives + feature widgets
  hooks/                    # Client hooks (React Query, forms, etc.)
  lib/                      # Schemas, utilities, S3 helpers
  server/
    api/                    # TRPC routers + router init
    application/            # Use-cases per domain (public/admin)
    data-access/            # Drizzle query builders per aggregate
    db/                     # Schema + database bootstrap
    auth.ts                 # Better Auth config and guards
  stores/                   # Zustand stores (e.g., variant selection)
  styles/                   # Tailwind + globals
  trpc/                     # Client/server TRPC helpers
```

Key entry points:

- `src/app/(public)/(landing)/page.tsx` – storefront hero, featured products, testimonials.
- `src/app/admin/(index)/page.tsx` – authenticated admin dashboard shell.
- `src/server/api/_app.ts` – TRPC root, wiring public + admin routers.
- `src/server/application/public/*` – public-facing use-cases.
- `src/server/data-access/public/*` – composable Drizzle queries for storefront flows.
- `src/server/db/schema/products.ts` – product + variant modeling.
- `src/server/auth.ts` – Better Auth setup, anonymous migration logic, guards.

## Domain & Features

- **Catalog**: products, categories, brands, media, SEO metadata.
- **Variants & Inventory**: attribute sets (size/color), stock tracking, low-stock alerts.
- **Carts & Checkout**: anonymous carts, migration to registered users, order + line items.
- **Reviews**: rating submissions, moderation hooks.
- **Admin Operations**: dashboards, quick actions for inventory updates, order state transitions.

### Layer Responsibilities

```
[ Client (RSC + client components) ]
              |
              v
[ TRPC Routers ] -> orchestrate use-cases and enforce auth
              v
[ Application Layer ] -> domain rules, validation, orchestration
              v
[ Data-Access Layer ] -> Drizzle queries, pagination, joins
              v
[ Postgres ] -> normalized schema from catalog to checkout
```

## Getting Started

### 1. Prerequisites

- Node.js 20+
- Bun (preferred) or PNPM
- Postgres database
- AWS S3 bucket (for real uploads)
- Sentry project (optional but recommended)

### 2. Install Dependencies

```bash
bun install   # or pnpm install
```

### 3. Configure Environment

```bash
find . -type f -name ".env.example" -exec sh -c 'cp "$1" "${1%.*}"' _ {} \;
```

Set database URLs, Better Auth secrets, OAuth providers, S3 credentials, and (optionally) Sentry DSNs.

### 4. Database Schema

```bash
bun db:migrate     # apply existing migrations
# bun db:generate  # create a new migration after schema edits
```

### 5. Run the App

```bash
bun dev
```

Visit `http://localhost:3000` for the storefront and `/admin` for the admin dashboard (ensure you have an admin user or seed data).

### 6. Optional Tooling

- `bun typecheck` – TypeScript in `--noEmit` mode.
- `bun lint` / `bun lint:fix` – ESLint (configured via `eslint.config.js`).
- `bun format:write` – Prettier + Tailwind plugin.

## Scripts

| Command                                 | Description                     |
| --------------------------------------- | ------------------------------- |
| `bun dev`                               | Start Next.js dev server        |
| `bun build`                             | Production build (`next build`) |
| `bun preview`                           | Build then `next start`         |
| `bun start`                             | Serve built app                 |
| `bun typecheck`                         | `tsc --noEmit`                  |
| `bun lint` / `bun lint:fix`             | ESLint (with optional auto-fix) |
| `bun db:generate`                       | Generate Drizzle migrations     |
| `bun db:migrate`                        | Apply migrations                |
| `bun db:push`                           | Push schema directly to DB      |
| `bun db:studio`                         | Launch Drizzle Studio           |
| `bun format:check` / `bun format:write` | Prettier                        |

## Observability

- Typed domain errors live in `src/server/lib/errors/app-error.ts`.
- Central TRPC error mapping via `src/server/api/error-map.ts`.
- Sentry instrumentation for server + edge runtimes (`src/sentry.server.config.ts`, `src/sentry.edge.config.ts`, `src/instrumentation*.ts`).
- Add your Sentry DSN in env files to enable tracing locally and in production.

## Contributing

1. Fork and create a feature branch (`git checkout -b feature/my-change`).
2. Install dependencies and run `bun dev`.
3. Add or update tests where applicable.
4. Lint & typecheck (`bun lint`, `bun typecheck`).
5. Open a PR with context, screenshots (swap placeholders), and test notes.
