# AGENTS.md

Guidance for AI coding agents (Claude Code, etc.) working in this repository. Read this before making changes. Keep edits consistent with the conventions below — this codebase is highly repetitive by design, so **match the surrounding feature folder** rather than inventing new patterns.

## What this project is

EMS (Employee Management System) — an internal HR + Finance + Payroll web app.

- **Framework:** Next.js 15 (App Router) with React 18, TypeScript, Turbopack in dev.
- **Auth:** NextAuth v4 (Credentials provider, JWT sessions) — kredensialnya diverifikasi backend.
- **Data:** SELURUHNYA lewat **`ems-backend`** (service PHP/Slim terpisah, repo `../ems_backend`).
  Aplikasi ini **tidak lagi menyentuh database**.
- **Domain language:** Indonesian. See the glossary at the bottom.
- **Rendering:** Server Components for pages + access control; Client Components (`"use client"`) for interactive views; Server Actions (`"use server"`) yang isinya memanggil backend.

> **Perubahan besar:** sampai v2.10 aplikasi ini fullstack — server action bicara
> langsung ke MySQL lewat Prisma. Sekarang seluruh logika bisnis, perhitungan,
> dan akses database pindah ke `ems-backend`. Yang tersisa di sini: UI, routing,
> session, dan pemanggilan API. Kalau butuh mengubah perhitungan gaji, absensi,
> atau aturan approval — **tempatnya di repo backend, bukan di sini.**

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # next build — jalankan ini untuk memastikan perubahan compile
npm run start    # production server
npm run lint     # next lint
```

Backend harus jalan agar aplikasi bisa dipakai (lihat `../ems_backend/README.md`).
Tidak ada test suite. Verifikasi dengan `npm run build` dan menjalankan aplikasinya.

### Prisma

`prisma/schema.prisma` **tetap dipertahankan sebagai sumber kebenaran skema
database** — backend memakai skema yang sama, dan `ems_backend/database/schema.sql`
digenerate dari berkas ini:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

Tapi Prisma Client **tidak lagi dipakai saat runtime**. Paket `@prisma/client`,
`pg`, dan `bcrypt` masih terpasang hanya untuk keperluan skema/seed; jangan
memakainya dari `src/`.

## Architecture at a glance

```
src/
├── app/
│   ├── (_pages)/            # Authenticated dashboard (sidebar + header layout)
│   │   ├── hr/              # datakaryawan, absensi, izin-*, ot-*, shift-*, reportattd-*
│   │   ├── finance/         # gaji, mastergaji, pph, thr, adjustmengaji
│   │   └── config/          # department, sub_department, user, roles, access, tanggalmerah, ...
│   ├── (others)/            # Public, tokenized views (slipgaji, slipthr, pengajuan-izin)
│   ├── auth/                # login / logout / redirect
│   └── api/
│       ├── auth/[...nextauth]/
│       └── mobile/*         # PROXY tipis ke backend (lihat di bawah)
├── components/              # Shared UI (Button, Pagination, Alert, Modal, Dashboard*, Filter*)
├── libs/                    # ApiClient, ProxyBackend, AuthOptions, date/format helpers, Slip PDF
├── middlewares/             # WithAuth.ts (JWT gate)
└── types/                   # Shared TS interfaces (index.ts)
```

Path alias: **`@/` → `src/`**.

## The feature-folder pattern (most important)

Tidak berubah. Setiap fitur CRUD di `(_pages)/{module}/{feature}/`:

```
{feature}/
├── page.tsx                 # SERVER component — entry point
├── _components/
│   ├── {Feature}View.tsx    # CLIENT — list, search, filter, pagination
│   ├── {Feature}Create.tsx  # CLIENT — create modal/form
│   └── {Feature}Edit.tsx    # CLIENT — edit modal/form
└── _libs/
    └── action.ts            # "use server" — memanggil ems-backend
```

**`page.tsx` (server):** memanggil `getServerSession(authOptions)`, menurunkan akses menu (`view`/`insert`/`update`/`delete`) dan akses department/sub-department, lalu merender `*View` dengan props `accessMenu`, `accessDepartment`, `accessSubDepartment`.

**`*View.tsx` (client):** memegang state UI dan memanggil server action. **Tidak berubah sama sekali oleh migrasi** — itu memang tujuannya.

## Server actions — memanggil backend

Isi `_libs/action.ts` sekarang tipis: terjemahkan argumen jadi request HTTP.

```ts
"use server";
import { apiList, apiPost } from "@/libs/ApiClient";

export const getDepartment = async (search?: string) => {
  const hasil = await apiList<DepartmentProps>("/api/config/department", { search });
  return { status: hasil.status, message: hasil.message, data: hasil.data };
};
```

Aturannya:

- **JANGAN ubah tanda tangan fungsi yang sudah ada.** Komponen `*View.tsx` memanggilnya apa adanya; mengubah argumen atau bentuk kembalian berarti menyentuh UI tanpa alasan.
- Bentuk kembalian tetap `{ status, message, data?, total_data? }`.
- `apiList()` menjamin `data` selalu array dan `total_data` selalu angka — halaman list memanggil `.map()` langsung, jadi `data: undefined` saat error akan melempar di render.
- `apiFetch(..., { tanpaToken: true })` untuk endpoint publik (slip gaji/THR, form izin).
- **Tidak perlu try/catch.** `ApiClient` tidak pernah melempar; kegagalan jaringan sekalipun kembali sebagai `{status:false, message}`.
- **Validasi dan hak akses ditegakkan backend**, tidak diulang di sini.

### Token

Login menukar kredensial ke backend, dan JWT-nya disimpan di session NextAuth
(`session.user.accessToken`). `ApiClient` mengambilnya lewat `getServerSession` —
semua pemanggilan terjadi di server, token tidak pernah sampai ke browser.

Masa berlaku session NextAuth dan token backend sama-sama 8 jam supaya keduanya
kedaluwarsa bersamaan.

## API mobile = proxy

`/api/mobile/*` dipertahankan URL-nya tapi isinya cuma meneruskan request ke
backend (`libs/ProxyBackend.ts`), supaya aplikasi mobile yang sudah beredar tidak
perlu rilis ulang. Jangan menambah logika di situ — tambahkan endpointnya di
backend, lalu buat proxy 5 baris seperti yang lain.

## Gotchas (learned the hard way)

1. **`document` / `window` di client component tetap ter-SSR.** Jaga nilai yang hanya ada di browser, mis. `menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}` pada react-select.
2. **Hydration mismatch dari script pihak ketiga.** Pace.js dimuat di `(_pages)/layout.tsx` dengan `strategy="afterInteractive"` — jangan dikembalikan ke `beforeInteractive`.
3. **Nomor baris ≠ id database.** Tampilkan `(currentPage - 1) * itemPerPage + index + 1`. Backend sudah mengirim field `number` pada endpoint yang berpaginasi.
4. **JANGAN `toISOString().split("T")[0]` untuk mengirim tanggal.** Date picker memberi tengah malam WIB; `toISOString()` mengubahnya jadi 17:00 UTC HARI SEBELUMNYA, sehingga tanggalnya mundur satu hari. Pakai `tanggalLokal()` dari `libs/ApiClient` (dan `jamLokal()` untuk jam).
5. **`sub_department_id` boleh NULL** dan pegawai seperti itu harus tetap muncul. Penyaringannya sudah di backend — jangan menambah filter sendiri di sini.
6. **Jangan memanggil database dari sini.** Tidak ada Prisma Client lagi di `src/`. Kalau butuh data baru, tambahkan endpoint di `ems-backend`.

## Environment variables

```
BACKEND_URL        # base URL ems-backend, TANPA garis miring di akhir (mis. http://localhost:9010)
JWT                # secret NextAuth. HARUS sama dengan JWT_SECRET_KEY di backend,
                   # dan minimal 32 karakter (lihat AGENTS.md backend bagian "Kunci JWT")
NEXTAUTH_URL       # base URL aplikasi ini
DATABASE_URL       # hanya untuk perkakas Prisma (migrate/seed), bukan runtime
```

`.env` git-ignored — jangan commit secret.

## Commit conventions

Conventional Commits, sering berbahasa Indonesia: `feat:`, `fix:`, `chore:`.
Subjek pendek dan imperatif. Kerjakan di branch dari `master` kecuali diminta lain.

## Indonesian domain glossary

| Term | Meaning |
|------|---------|
| pegawai / karyawan | employee |
| absen / absensi | attendance / check-in–out |
| izin | leave / permission request |
| cuti | annual leave; `sakit` = sick |
| gaji | salary; `mastergaji` = salary component master |
| lembur / overtime (ot) | overtime |
| THR | Tunjangan Hari Raya |
| PPH / PPH21 | income tax |
| shift | work shift (`jam_masuk`/`jam_pulang`) |
| tanggal merah | public holiday |
| departemen / sub_department | org units |
| atasan | supervisor / leader |
| pengajuan | request/submission |
| slip gaji / slip thr | payslip / THR slip |
