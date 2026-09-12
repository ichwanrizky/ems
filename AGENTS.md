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
- **UI:** template **WorkLoad** (DexignLab, Bootstrap 5) di `public/workload/`.

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
│   │   ├── sales/           # customer, quotation
│   │   └── config/          # department, sub_department, user, roles, access, tanggalmerah, ...
│   ├── (others)/            # Public, tokenized views (slipgaji, slipthr, pengajuan-izin)
│   ├── auth/                # login / logout / redirect
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── mobile/*         # PROXY tipis ke backend (lihat di bawah)
│       └── sales/quotation/[id]/pdf   # penerus PDF (biner, bukan JSON)
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

## Validasi form dengan zod (modul Sales)

Modul Sales memakai **zod** untuk validasi form; modul lain masih mengandalkan
atribut `required` bawaan HTML. Kalau menambah form di Sales, ikuti pola ini —
jangan campur dengan `required`, karena validasi native menyela submit lebih
dulu dan pesannya tidak bisa diseragamkan.

Skemanya ditulis di `_libs/skema.ts`, **bukan** di dalam komponen: `action.ts`
ber-`"use server"`, dan mengimpor skema dari berkas komponen akan menarik
komponen client itu ke bundel server.

Satu skema dipakai dua kali dalam satu submit:

1. **Di komponen**, sebelum request — supaya salah ketik tidak perlu perjalanan
   ke server, dan pesannya menempel di bawah field yang benar
   (`is-invalid` + `.invalid-feedback`).
2. **Di server action**, sebelum memanggil backend — gerbang terakhir untuk
   pemanggilan yang tidak lewat form.

Keduanya percepatan dan jaring pengaman, **bukan** penentu sah-tidaknya data.
Yang menentukan tetap backend: ia yang memegang keunikan dan dipanggil juga dari
luar aplikasi ini. Jangan pernah menaruh aturan yang hanya ada di zod.

Catatan zod v4 yang beda dari v3: `z.email()` (bukan `z.string().email()`), dan
error dibaca dari `hasil.error.issues` (`.flatten()` sudah usang).

## Sales > Quotation

Modul penawaran harga — satu-satunya yang lahir SETELAH migrasi, jadi seluruh
logikanya memang sudah di backend sejak awal. Yang perlu diketahui saat
menyentuhnya dari sini:

- **Form tambah/ubahnya halaman sendiri**, bukan modal: `sales/quotation/create`
  dan `sales/quotation/edit?id=`. Satu penawaran bisa berisi puluhan baris item,
  dan tabel sepanjang itu di dalam modal memaksa dua scrollbar bersarang —
  polanya mengikuti `hr/datakaryawan/create`. Yang tetap modal cuma detail,
  karena isinya dibaca sekilas lalu ditutup. `QuotationForm` dipakai kedua
  halaman itu; modenya ditentukan ada-tidaknya prop `quotationEdit`.
- **Jangan menghitung total di sini.** `QuotationForm` memang menjumlahkan
  subtotal/PPN/total sambil user mengetik, tapi itu murni pratinjau — yang
  disimpan dan yang tercetak dihitung ulang backend dari item. Begitu dua tempat
  menghitung hal yang sama, suatu hari keduanya akan berbeda.
- **Validasinya zod, error itemnya dikunci path.** `_libs/skema.ts` memvalidasi
  seluruh form termasuk item yang bersarang dua tingkat, jadi peta errornya
  dikunci `grup.0.item.2.qty` — bukan nama field. Komponen membacanya lewat
  `kunciGrup()` / `kunciItem()`, dan `ringkasError()` menaikkan error pertama ke
  alert atas form karena tabel itemnya bisa sepanjang layar. Batas angkanya
  (grup 20, item 200, gambar 6, persen 0–100) disalin dari `QuotationController`
  dan harus tetap sama dengannya.
- **TIDAK ada alur status.** Penawaran tidak punya siklus hidup di UI: tidak ada
  kirim, setujui, tolak, atau batalkan. Yang ada cuma dokumennya — buat, ubah,
  cetak, hapus. Alasannya penawaran dikirim lewat email/WhatsApp di luar
  aplikasi ini, dan status yang harus dipelihara tangan selalu berakhir bohong:
  tidak ada yang kembali ke sini untuk menandai "sudah dikirim".

  Satu-satunya keadaan yang ditampilkan adalah yang dihitung sendiri oleh
  sistem — `kadaluarsa`, yaitu `berlaku_sampai` yang sudah lewat. Nilainya
  diturunkan **backend** (`QuotationController`), bukan `new Date()` di browser:
  jam browser bisa salah, dan menandai penawaran kedaluwarsa sehari lebih cepat
  membuat orang membatalkan tawaran yang masih sah.

  Kolom `status` masih ada di database dan endpoint `/status` serta `/revisi`
  masih hidup di backend, tapi **tidak ada UI yang memanggilnya** — semua baris
  baru lahir dan menetap sebagai `draft`. Jangan menambah tombol yang
  membangunkannya kembali tanpa memutuskan dulu alur statusnya seperti apa.
- **PDF-nya biner, jadi tidak lewat `ApiClient`.** `ApiClient` selalu mem-parse
  JSON dan tokennya tidak pernah sampai ke browser, karena itu ada route
  `app/api/sales/quotation/[nomor]/pdf/route.ts` yang mengambilkan di server.
  `ProxyBackend` tidak bisa dipakai — ia selalu mem-parse JSON.

  **Tautannya dikunci NOMOR, bukan id**, karena ia terlihat orang: muncul di
  address bar tab baru, disalin ke chat, dan jadi nama berkas unduhan.
  `…/quotation/1/pdf` tidak memberi tahu apa pun tentang isinya. Jangan menyusun
  URL-nya dengan tangan — pakai `tautanPdf(nomor)` dari `_libs/skema.ts`, yang
  mengganti garis miring nomor jadi strip (`001/QUO/PJ/IX/2026` →
  `001-QUO-PJ-IX-2026`; tambah argumen `true` untuk `?unduh=1`).

  Garis miring itu **tidak** di-`encodeURIComponent`: `%2F` di dalam path
  ditolak sebagian proxy dan dinormalkan sebagian yang lain, jadi tautannya akan
  hidup-mati tergantung apa yang berdiri di depan aplikasi. Backend mencocokkan
  ke arah sebaliknya (`REPLACE(nomor, '/', '-')` di SQL), jadi penggantian ini
  memang tidak perlu bisa dibalik.
- Menu SALES dan hak aksesnya lahir dari `ems_backend/database/migrasi-sales.sql`,
  bukan dari kode di sini. Sidebar menyusun dirinya dari tabel `menu`/`access`,
  jadi setelah migrasi dijalankan usernya perlu **login ulang** agar menunya
  muncul di session.

## Template UI (WorkLoad)

Aset template ada di `public/workload/` — `css/style.css` milik template (jangan
diedit isinya kecuali daftar `@import` yang memang sudah dipangkas ke ikon yang
dipakai), dan `css/ems.css` **tempat semua penyesuaian kita**. Kalau perlu menimpa
gaya template, tulis di `ems.css` beserta alasannya, bukan di `style.css`.

Kerangka halaman dashboard (`(_pages)/layout.tsx`):

```
<div id="main-wrapper" class="show">
  .nav-header      → NavHeader.tsx        (logo + hamburger)
  .header          → DashboardHeader.tsx  (judul halaman + profil)
  .dlabnav         → DashboardSidebar.tsx (menu dari session)
  .content-body > .container-fluid → {children}
  .footer
</div>
```

Aturan yang gampang dilanggar:

- **Textarea selalu lewat `components/Textarea.tsx`, jangan `<textarea>` polos.**
  Teks di dalam textarea selalu mulai dari atas — tidak ada `vertical-align`
  yang bisa menengahkannya — jadi textarea ber-`rows` tetap selalu terlihat
  "teksnya nempel di atas" dengan ruang kosong menganga di bawah, apalagi karena
  template mematok input setinggi `3.5rem`. Komponen itu menghapus ruang
  kosongnya: tingginya mengikuti isi, sehingga satu baris tampil setinggi dan
  serata `<input>` di sebelahnya, dan isi panjang membuat kotaknya tumbuh.
  Jangan mengoper `rows` (tingginya dihitung) dan jangan mengulang
  `className="form-control"` (komponen sudah menambahkannya).

- **`page.tsx` mulai dari breadcrumb, bukan dari pembungkus.** Kerangka dan
  scrolling sudah dipegang layout. Pakai `<>` lalu `<div className="row page-titles mx-0">`.
- **Ikon memakai Font Awesome** (`fas fa-*`); Bootstrap Icons (`bi bi-*`) masih
  tersedia. Material Icons sudah tidak dimuat lagi.
- **metisMenu dan `custom.js` bawaan template tidak dipakai** — keduanya mengubah
  DOM yang dimiliki React. Perilaku sidebar ditulis ulang di `SidebarInit.tsx`.
  Yang dimuat hanya `vendor/global/global.min.js` (jQuery + bundel Bootstrap)
  untuk dropdown dan tooltip.
- **Gaya sidebar mengikuti lebar layar** (`libs/Theme.ts`): <768 `overlay`,
  <1200 `mini`, selebihnya `full`. Ambang batasnya jangan digandakan di tempat lain.
- **Tema terang/gelap** cuma atribut `data-theme-version` pada `<body>` — style.css
  template sudah punya ~1450 aturan untuk `dark`. `ThemeToggle.tsx` membaliknya dan
  menyimpannya di localStorage; `SKRIP_TEMA` di `libs/Theme.ts` memasangnya sebelum
  paint pertama. Ikon tombolnya **dipilih CSS**, bukan state React — pakai state
  berarti server merender ikon tema terang dan ikonnya berkedip salah saat hydration.

## Gotchas (learned the hard way)

1. **`document` / `window` di client component tetap ter-SSR.** Jaga nilai yang hanya ada di browser, mis. `menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}` pada react-select.
2. **Gaya sidebar diubah skrip sebelum hydration.** `<body>` menerima `data-sidebar-style` dari skrip inline di `app/layout.tsx`, karena itu `<body>` memakai `suppressHydrationWarning`. Jangan dihapus.
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
| quotation / penawaran | price quotation to a customer |
| terbilang | amount spelled out in words |
| DPP | taxable base (subtotal after discount) |
