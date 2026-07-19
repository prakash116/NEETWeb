# NEET Exam System — Website

Frontend for the NEET Exam System: student website + admin panel. Built with
Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query,
Zustand, React Hook Form, Zod, Framer Motion, and Axios.

The full design reference (sitemap, design system, layouts, architecture, and
the module-by-module implementation plan) lives in
[`../FRONTEND-DESIGN.md`](../FRONTEND-DESIGN.md).

## Prerequisites

- Node.js 20+ and **pnpm**
- The backend API running from [`../Server`](../Server) at
  `http://localhost:4000` (Swagger at `http://localhost:4000/docs`)

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Environment

Copy `.env.example` to `.env.local` (already present in dev):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (`http://localhost:4000/api/v1`) |
| `NEXT_PUBLIC_FEATURE_PASSWORD_RESET` | Enables forgot/reset-password pages once the backend ships those endpoints |

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build + type check |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Source layout

```
src/
├─ app/          # App Router routes (route groups per FRONTEND-DESIGN.md §7)
├─ components/   # ui/ (shadcn, generated) · providers.tsx · common/ · layout/ · charts/
├─ features/     # feature modules: api.ts · hooks.ts · schemas.ts · components/
├─ lib/          # api-client (envelope + token refresh) · auth-tokens · env ·
│                # query-client · query-keys · labels · format · utils
├─ stores/       # Zustand: ui-store (auth-store and exam-store arrive with M1/M8)
├─ types/        # api.ts (envelope/pagination) · entities.ts (backend contracts)
└─ config/       # site.ts · nav.ts
```

Conventions worth knowing:

- Every backend response is unwrapped from `{ success, message, data }` by
  `lib/api-client.ts`; failures become typed `ApiError`s with the server message.
- Access token lives in memory; the refresh token persists and rotates via a
  single-flight 401 interceptor.
- Server state belongs to TanStack Query (keys in `lib/query-keys.ts`);
  Zustand is only for UI/auth/exam-runner state.
- Design tokens are CSS variables in `src/app/globals.css`; subject colors are
  fixed and mirrored in `lib/labels.ts` (`SUBJECT_VISUALS`).

## Module progress

- [x] **M0** Scaffold + design system
- [ ] M1 Authentication · M2 App shells · M3 Landing page · M4–M6 Admin content
      pipeline · M7–M9 Student exam flow + runner + results · M10 Dashboards ·
      M11 Notifications & profile · M12 Admin people & system
