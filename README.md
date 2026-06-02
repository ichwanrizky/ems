# EMS — Employee Management System

An internal web application for managing employees, attendance, leave, overtime, and payroll, built with **Next.js 15** and **Prisma**. The UI and domain language are in Indonesian.

> Looking to contribute or have an AI agent work in this repo? Read **[AGENTS.md](AGENTS.md)** for architecture and conventions.

## Features

- **HR**
  - Employee master data (`datakaryawan`)
  - Attendance: daily, per-employee, and monthly/by-date reports (`absensi`, `absensiperpegawai`, `reportattd-*`)
  - Leave requests & history (`izin-pengajuan`, `izin-riwayat`)
  - Overtime requests & history (`ot-pengajuan`, `ot-riwayat`, `ot-perpegawai`)
  - Work shifts (`shift-master`, `shift-active`)
- **Finance / Payroll**
  - Salary processing and slips (`gaji`)
  - Salary component master (`mastergaji`)
  - PPH21 income tax (`pph`)
  - THR / 13th-month pay (`thr`)
  - Salary adjustments (`adjustmengaji`)
- **Configuration**
  - Departments & sub-departments, users, roles & access control (RBAC)
  - Public holidays (`tanggalmerah`), locations, mobile tokens
- **Public slips** — tokenized, no-login views for salary slips, THR slips, and leave approvals
- **Mobile API** — endpoints under `/api/mobile/*` for the companion mobile app (location-based check-in, leave/overtime requests, payslips)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Turbopack), React 18, TypeScript |
| Auth | NextAuth v4 (Credentials provider, JWT sessions) |
| Database | MySQL via Prisma 5 |
| PDF / slips | `@react-pdf/renderer` |
| Spreadsheets | `xlsx` |
| UI | Bootstrap 5 + custom SCSS themes, `react-select`, `react-datepicker` |

## Getting started

### Prerequisites

- Node.js 20+
- MySQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env in the project root (see below)

# 3. Generate the Prisma client
npx prisma generate

# 4. (optional) Seed menus / roles / access
npx prisma db seed

# 5. Run the dev server
npm run dev
```

App runs at http://localhost:3000.

### Environment variables (`.env`)

```env
DATABASE_URL="mysql://user:password@localhost:3306/db_ems"
DATABASE_URL_V1="mysql://user:password@localhost:3306/db_ems_v1"
JWT="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

`.env` is git-ignored — never commit secrets.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (use this to verify changes compile) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate the Prisma client after editing `schema.prisma` |
| `npx prisma db seed` | Seed menu / roles / access data |

## Project structure

```
src/
├── app/
│   ├── (_pages)/        # Authenticated dashboard (hr / finance / config)
│   ├── (others)/        # Public tokenized slip views
│   ├── auth/            # Login / logout
│   └── api/             # NextAuth + mobile + v2 APIs
├── components/          # Shared UI components
├── libs/                # Prisma client, auth, date utils, tax, attendance
├── middlewares/         # Auth gate
└── types/               # Shared TypeScript types
prisma/
├── schema.prisma        # Data model (MySQL)
└── seed.ts              # Seed script
```

Each feature folder follows a consistent layout (`page.tsx` server entry → `_components/*View|Create|Edit` clients → `_libs/action.ts` server actions). See **[AGENTS.md](AGENTS.md)** for the full convention.

## Access control

Authentication is username/password via NextAuth. Authorization is role-based: each role grants per-menu CRUD permissions (`view` / `insert` / `update` / `delete`) plus department and sub-department scoping, all carried in the JWT session. Routes under `/hr`, `/finance`, and `/config` are gated by middleware.

## Notes

- Dates are stored in UTC and presented in WIB (UTC+7); use the helpers in `src/libs/ConvertDate.tsx` and `src/libs/DisplayDate.tsx`.
- The codebase uses Indonesian domain terms (pegawai = employee, izin = leave, gaji = salary, absen = attendance, lembur = overtime, THR, PPH = tax, tanggal merah = public holiday). A full glossary is in [AGENTS.md](AGENTS.md).

---

*Internal project — all rights reserved.*
