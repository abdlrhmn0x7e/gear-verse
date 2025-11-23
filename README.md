# Gear Verse

A full‑stack, production‑style e‑commerce platform for gaming and tech gear.

Gear Verse includes a customer‑facing storefront and a full admin dashboard, built with a layered architecture (presentation → application → data‑access → database) and modern tooling (Next.js App Router, TRPC, Drizzle ORM, Better Auth, S3, and Sentry).

---

## 1. What This Project Demonstrates

- **Realistic e‑commerce domain**: products, variants, categories, carts, orders, inventory, reviews, brands.
- **Layered backend**:
  - `app/` – Next.js routing and UI
  - `server/api` – TRPC routers
  - `server/application` – business use‑cases
  - `server/data-access` – DB queries
  - `server/db/schema` – Drizzle models
- **Modern auth** with Better Auth, including **anonymous → registered user migration**.
- **File uploads** via S3 presigned URLs.
- **Observability** with Sentry and typed error mapping.
- **Polished admin UX** with dashboards, tables, and quick actions.

All of this is implemented in the repo you’re looking at; the diagrams below map directly to concrete files.

---

## 2. Tech Stack

- **Framework**: `Next.js 16` (App Router, Server Components)
- **Language**: `TypeScript 5`
- **Runtime / tooling**:
  - Bun (used in CI commands)
  - Node.js 20+
- **UI**:
  - React 19 (Server + Client Components)
  - Tailwind CSS 4 (`src/styles/globals.css`)
  - Radix primitives and custom UI components under `src/components/ui`
  - Feature components under `src/components/features`
- **Data & state**:
  - `@tanstack/react-query` & TRPC hooks for client data
  - `zustand` and React context (`src/stores/variant-selection`, etc.)
- **Forms & validation**:
  - `react-hook-form`
  - `zod` schemas in `src/lib/schemas`
- **Backend**:
  - TRPC v11 (`src/server/api/_app.ts`, `src/server/api/routers/*`)
  - Drizzle ORM (`src/server/db/schema/*.ts`, `src/server/db/index.ts`)
  - Postgres (via `postgres` driver)
  - Better Auth (`src/server/auth.ts`)
  - S3 via AWS SDK (`src/lib/s3.ts`)
- **Observability**:
  - Sentry (`src/sentry.server.config.ts`, `src/sentry.edge.config.ts`, `src/instrumentation.ts`)
- **Tooling**:
  - ESLint 9 + `eslint-config-next` (`eslint.config.js`)
  - Prettier + Tailwind plugin (`prettier.config.js`)
  - Tailwind 4 (`tailwind.config.js`, `postcss.config.js`)

---

## 3. Project Structure (with Pointers)

```text
src/
  app/
    (public)/              # Storefront & landing pages
      (landing)/page.tsx   # Hero, recent products, testimonials
      products/            # Product list & detail pages
      categories/          # Category listing & SEO pages
    admin/                 # Admin dashboard & CRUD UIs
      (index)/page.tsx     # Admin home/dashboard
      products/            # Product & variant management
      orders/              # Orders list & detail
      inventory/           # Inventory management
    api/
      auth/                # Better Auth route handler
      trpc/                # TRPC handler
    layout.tsx             # App shell (navbar/footer/theme)

  components/              # Reusable UI & feature components
  hooks/                   # Client hooks
  lib/                     # Schemas, utils, S3 client, etc.
  server/
    api/                   # TRPC routers and init
    application/           # Use‑cases (admin + public)
    data-access/           # DB access per feature
    db/                    # Drizzle ORM schema + db init
    auth.ts                # Better Auth config and guards

  stores/                  # Zustand stores (e.g. variant selection)
  styles/                  # Global styles
  trpc/                    # TRPC client + server helpers
```

Key entry points that match the diagrams below:

- Landing / marketing: `src/app/(public)/(landing)/page.tsx`
- Admin dashboard: `src/app/admin/(index)/page.tsx`
- TRPC root: `src/server/api/_app.ts`
- Public routers: `src/server/api/routers/public/*.ts`
- Public application layer: `src/server/application/public/*.ts`
- Public data‑access: `src/server/data-access/public/*.ts`
- Product schema: `src/server/db/schema/products.ts`
- Auth: `src/server/auth.ts`
- S3: `src/lib/s3.ts`

---

## 4. Architecture Diagrams

### 4.1 High‑Level Backend Layers

```text
[ Browser / Client Components ]
                |
                v
[ Next.js App Router (src/app) ]
  - page.tsx / layout.tsx
  - server components & actions
                |
                v
[ TRPC API (src/server/api) ]
  - appRouter (admin, public)
  - routers/* (products, orders, carts, ...)
                |
                v
[ Application Layer (src/server/application) ]
  - Use‑cases per domain (products, checkout, orders)
  - Cross‑cutting domain rules
                |
                v
[ Data‑Access Layer (src/server/data-access) ]
  - Drizzle queries per aggregate
  - Pagination, filtering, joins
                |
                v
[ Database (src/server/db/schema + Postgres) ]
  - Products, categories, variants, inventory
  - Carts, orders, users, addresses, reviews, brands
```

This is not just theoretical – each layer has its own directory and files wired together via TRPC.


### 4.3 Auth & Anonymous User Migration

Concrete file: `src/server/auth.ts`

```text
[ Better Auth config ]
(baseURL, drizzleAdapter(db), social providers)
        |
        | plugins: admin(), anonymous()
        v
[ Anonymous plugin onLinkAccount ]
        |
        |  When an anonymous user signs up or logs in:
        |    - Run a DB transaction
        |    - Delete any existing cart for the new user
        |    - Move carts, addresses, orders from
        |      anonymous user → new user
        |    - Delete anonymous user record
        v
[ requireAuth / requireAdmin guards ]
  - used in admin pages like
    src/app/admin/(index)/page.tsx
  - non‑admin or unauthenticated → 404 (notFound())
```

This ensures carts and order history created before authentication follow the user after they create an account – something many demo apps skip.

## 5. Domain Model Overview

Based on `src/server/db/schema/*.ts`, the core domain entities are:

- `products.ts` – base product info
- `attributes.ts` – product attributes (e.g., size, color)
- `brands.ts` – product brands
- `categories.ts` – product categories
- `products-media.ts` / `media.ts` – media linked to products
- `inventory.ts` – stock data
- `carts.ts` – shopping carts
- `orders.ts` – orders and line items
- `users.ts` / `addresses.ts` – customers and their addresses
- `reviews.ts` – product reviews
- `seo.ts` – SEO metadata

---

## 6. Error Handling & Observability

- **Domain errors**: `src/server/lib/errors/app-error.ts` defines typed error classes.
- **TRPC error mapping**: `src/server/api/error-map.ts` converts those to TRPC errors.
- **Sentry**:
  - Server configuration: `src/sentry.server.config.ts`
  - Edge/runtime configuration: `src/sentry.edge.config.ts`
  - Instrumentation hooks: `src/instrumentation.ts`, `src/instrumentation-client.ts`

The combination gives you:

- Centralized domain error handling.
- Type‑safe error responses to the client.
- Central logging and tracing of issues in Sentry.

---

## 7. Getting Started (Local)

### Prerequisites

- Node.js 20+
- Bun (or your preferred package manager)
- Postgres database
- AWS S3 bucket (optional but needed for real uploads)

### 1. Install Dependencies

```bash
bun install
# or
pnpm install
```

### 2. Configure Environment

Copy example env files and edit values:

```bash
find . -type f -name ".env.example" -exec sh -c 'cp "$1" "${1%.*}"' _ {} \;
```

Fill in variables for:

- Database connection URL
- Auth configuration (Better Auth, Google OAuth, etc.)
- AWS S3 (`AWS_S3_REGION`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`)
- Sentry DSN (optional)

### 3. Run Migrations

```bash
bun db:migrate
```

(Use `bun db:generate` if you change schema.)

### 4. Start Dev Server

```bash
bun dev
```

Visit `http://localhost:3000` for the storefront and `/admin` for the admin dashboard (after seeding or creating an admin user).

---

## 8. Scripts Overview

From `package.json`:

- `bun dev` – Run Next.js dev server
- `bun build` – Production build
- `bun preview` – Build then start (`next build && next start`)
- `bun start` – Run built app
- `bun typecheck` – TypeScript typecheck (`tsc --noEmit`)
- `bun lint` – `next lint`
- `bun lint:fix` – ESLint with `--fix`
- `bun db:generate` – Generate Drizzle migrations
- `bun db:migrate` – Run migrations
- `bun db:push` – Push schema to DB
- `bun db:studio` – Drizzle Studio
- `bun format:check` / `bun format:write` – Prettier
