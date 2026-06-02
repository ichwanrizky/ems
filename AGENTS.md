# AGENTS.md

Guidance for AI coding agents (Claude Code, etc.) working in this repository. Read this before making changes. Keep edits consistent with the conventions below — this codebase is highly repetitive by design, so **match the surrounding feature folder** rather than inventing new patterns.

## What this project is

EMS (Employee Management System) — an internal HR + Finance + Payroll web app.

- **Framework:** Next.js 15 (App Router) with React 18, TypeScript, Turbopack in dev.
- **Auth:** NextAuth v4 (Credentials provider, JWT sessions).
- **DB/ORM:** Prisma 5 → MySQL (`datasource db { provider = "mysql" }`).
- **Domain language:** Indonesian. See the glossary at the bottom.
- **Rendering:** Server Components for pages + access control; Client Components (`"use client"`) for interactive views; Server Actions (`"use server"`) for all data access.

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # next build  — run this to verify a change compiles
npm run start    # production server
npm run lint     # next lint
npx prisma generate           # regenerate client after schema.prisma changes
npx prisma db seed            # seed menu/roles/access (prisma/seed.ts)
```

There is **no test suite**. Verify changes with `npm run build` and by running the app. Past commits show recurring `fix: build error` — always confirm a build passes before committing.

## Architecture at a glance

```
src/
├── app/
│   ├── (_pages)/            # Authenticated dashboard (sidebar + header layout)
│   │   ├── layout.tsx       # Dashboard shell; loads session, redirects if none
│   │   ├── hr/              # datakaryawan, absensi, izin-*, ot-*, shift-*, reportattd-*
│   │   ├── finance/         # gaji, mastergaji, pph, thr, adjustmengaji
│   │   └── config/          # department, sub_department, user, roles, access, tanggalmerah, ...
│   ├── (others)/            # Public, tokenized slip views (slipgaji, slipthr, pengajuan-izin)
│   ├── auth/                # login / logout / redirect (no auth required)
│   └── api/                 # NextAuth handler + /api/mobile/* + /api/v2/*
├── components/              # Shared UI (Button, Pagination, Alert, Modal, Dashboard*, Filter*)
├── libs/                    # Prisma client, AuthOptions, date utils, Pph, AttendanceData, Error
├── middlewares/             # WithAuth.ts (JWT gate)
├── types/                   # Shared TS interfaces (index.ts)
└── middleware.ts            # Root middleware → delegates to WithAuth
```

Path alias: **`@/` → `src/`** (e.g. `import prisma from "@/libs/Prisma"`).

## The feature-folder pattern (most important)

Every CRUD feature under `(_pages)/{module}/{feature}/` follows the same shape. When adding or editing a feature, mirror an existing one (e.g. `hr/datakaryawan`).

```
{feature}/
├── page.tsx                 # SERVER component — entry point
├── _components/
│   ├── {Feature}View.tsx    # CLIENT — list, search, filter, pagination, action dispatch
│   ├── {Feature}Create.tsx  # CLIENT — create modal/form
│   └── {Feature}Edit.tsx    # CLIENT — edit modal/form
└── _libs/
    └── action.ts            # "use server" — all DB reads/writes for this feature
```

**`page.tsx` (server):** calls `getServerSession(authOptions)`, derives the current user's menu access (`view`/`insert`/`update`/`delete`) and department/sub-department access, then renders the `*View` client component passing `accessMenu`, `accessDepartment`, `accessSubDepartment` as props. If the user lacks `view`, it renders an access-denied state instead.

**`*View.tsx` (client):** owns UI state (`search`, `filter`, `currentPage`, loading, alert), calls the server actions, and gates buttons on `accessMenu.insert/update/delete`.

## Server actions conventions

In `_libs/action.ts` files (and `src/libs/*` server utilities):

- First line is `"use server";`.
- Every action is `async` and returns a **consistent shape**:
  ```ts
  { status: boolean; message: string; data?: T; total_data?: number }
  ```
  List endpoints include `total_data` for pagination.
- Get the user with `const session: any = await getServerSession(authOptions);`.
- Use the shared singleton: `import prisma from "@/libs/Prisma";`.
- Wrap the body in `try/catch` and `return HandleError(error) as any;` in the catch.
- **Pagination:** 10 per page. `skip: (currentPage - 1) * 10`, `take: 10`, page is 1-indexed. Count + findMany run via `Promise.all`.
- **Sub-department access** is enforced in `where` with `OR: [{ sub_department_id: null }, { sub_department_id: { in: [...accessIds] } }]`. Employees with `sub_department_id = NULL` are valid and **must not be excluded** — when writing raw SQL use `LEFT JOIN sub_department`, never an inner `JOIN`.

### Raw SQL (`$queryRawUnsafe`)

Attendance reports build SQL strings dynamically:
`src/libs/AttendanceData.tsx`, `hr/reportattd-bulan/_libs/action.ts`, `hr/reportattd-tanggal/_libs/action.ts`.

- Only interpolate **numeric** ids / dates you control. Never interpolate raw user text without escaping (see the `search.replace(/[\\%_'"]/g, "\\$&")` guard in reportattd-bulan).
- Date columns are matched against generated `'YYYY-MM-DD'` strings; keep the `+7` hour WIB offset logic in `getDatesInMonth`/`getDatesInRange` intact.
- Use `LEFT JOIN` for `sub_department` and any optional relation so NULL rows survive.

## Auth & access control

- Config: `src/libs/AuthOptions.tsx` — Credentials provider, JWT strategy (8h), secret from `process.env.JWT`.
- The JWT/session carries: `id, username, name, role_id, role_name, access_department[], access_sub_department[], menu[]`.
- `menu[]` encodes per-menu CRUD flags (`access: { view, insert, update, delete }`). Pages resolve the entry matching their route `path`.
- Route protection: `src/middleware.ts` → `src/middlewares/WithAuth.ts` gates `/hr/*`, `/finance/*`, `/config/*`; unauthenticated users are redirected to `/auth/login`.

## Shared libraries (`src/libs/`)

| File | Purpose |
|------|---------|
| `Prisma.tsx` | Default PrismaClient singleton (MySQL via `DATABASE_URL`). |
| `PrismaV1.tsx` + `prisma/generated/client-v1` | Secondary generated client (`DATABASE_URL_V1`). Don't hand-edit generated output. |
| `AuthOptions.tsx` | NextAuth options, session/JWT shaping, access loading. |
| `Error.tsx` | `HandleError(error)` → standardized `{status:false, message}`. |
| `ConvertDate.tsx` | `ConvertDate`, `DatePlus7Format`, `ConvertDateZeroHours` — WIB (+7) handling. |
| `DisplayDate.tsx` | `DisplayDate`, `DisplayHour`, `getDayInIndonesian`, month/day formatting. |
| `AttendanceData.tsx` | Raw-SQL monthly attendance builder used by per-employee + reports. |
| `Pph.tsx` | PPH21 income-tax (TER A/B/C bracket) calculation. |
| `SlipGaji.tsx`, `SlipThr.tsx` | PDF/slip rendering (`@react-pdf/renderer`). |

## Shared components (`src/components/`)

`Button` (note `type="actionTable"` for the row 3-dots dropdown), `Pagination`, `Alert` (auto-dismiss ~2s, colors `success`/`danger`), `Modal`, `DashboardHeader`, `DashboardSidebar` + `SidebarInit`, `Filter*`.

## Gotchas (learned the hard way)

1. **`document` / `window` in client components are still SSR-rendered.** Guard browser-only values, e.g. `react-select`'s `menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}`. Bare `document.body` throws `ReferenceError: document is not defined` during SSR.
2. **Hydration mismatches from third-party scripts.** Pace.js (the top progress bar) is loaded in `(_pages)/layout.tsx` with `strategy="afterInteractive"` — do **not** switch it back to `beforeInteractive`; it injects DOM before hydration and breaks React.
3. **Row numbers ≠ database id.** Display sequential numbers as `(currentPage - 1) * itemPerPage + index + 1`, not `item.id`.
4. **NULL sub-department.** Many employees have `sub_department_id = NULL`. Inner-joining `sub_department` silently drops them from reports. Always `LEFT JOIN` and allow `IS NULL` in filters.
5. **Timezone.** DB stores UTC; the app is WIB (+7). Reuse the existing `ConvertDate*` helpers instead of rolling new offset math.
6. **MySQL, not Postgres.** Despite `pg`/`@prisma/adapter-pg` appearing in `package.json`, the live `schema.prisma` datasource is `mysql`. Write MySQL-compatible SQL.

## Environment variables

```
DATABASE_URL       # MySQL connection string (Prisma datasource)
DATABASE_URL_V1    # secondary DB for the client-v1 generated client
JWT                # NextAuth secret (also used by mobile auth)
NEXTAUTH_URL       # base URL for callbacks / links
```
`.env` is git-ignored — never commit secrets.

## Commit conventions

Follow the existing history style (Conventional Commits, often Indonesian):
`feat:`, `fix:`, `chore:` — e.g. `fix: izin pengajuan sub dept null`, `feat: add is tax master gaji`.
Keep subjects short and imperative. Work on a branch off `master` unless told otherwise.

## Indonesian domain glossary

| Term | Meaning |
|------|---------|
| pegawai | employee |
| karyawan | employee (data karyawan = employee data) |
| absen / absensi | attendance / check-in–out |
| izin | leave / permission request |
| cuti | annual leave; `sakit` = sick |
| gaji | salary; `mastergaji` = salary component master |
| lembur / overtime (ot) | overtime |
| THR | Tunjangan Hari Raya (religious-holiday 13th-month pay) |
| PPH / PPH21 | income tax |
| shift | work shift (`jam_masuk`/`jam_pulang` = clock-in/out time) |
| tanggal merah | public holiday |
| departemen / sub_department | org units |
| atasan | supervisor / leader |
| pengajuan | request/submission (e.g. `pengajuan-izin`) |
| slip gaji / slip thr | payslip / THR slip |
