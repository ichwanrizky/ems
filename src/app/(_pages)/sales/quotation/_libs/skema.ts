import { z } from "zod";

/**
 * Validasi form quotation.
 *
 * Dipakai DUA kali untuk satu submit: di `QuotationForm` supaya kesalahan
 * muncul di bawah fieldnya tanpa perjalanan ke server, dan di server action
 * sebagai gerbang terakhir. Berkas tersendiri karena `action.ts` ber-"use
 * server" — mengimpor skema dari komponen client akan menarik komponen itu ke
 * bundel server.
 *
 * Ini TIDAK menggantikan validasi backend; lihat `QuotationController`. Yang di
 * sini cuma mempercepat ketahuannya salah ketik, dan membuat pesannya menempel
 * di baris item yang benar — hal yang tidak bisa dilakukan pesan tunggal dari
 * backend ("Qty grup Alat Elektronik baris ke-3 harus lebih dari 0" tetap
 * mengharuskan user menghitung barisnya sendiri).
 *
 * ## Error bersarang
 *
 * Form ini bukan sederet field datar: itemnya bersarang dua tingkat. Jadi peta
 * errornya dikunci PATH (`grup.0.item.2.qty`), bukan nama field, dan komponen
 * mengambilnya lewat `kunciItem()` / `kunciGrup()` supaya penulisan kuncinya
 * tidak tersebar sebagai string literal.
 *
 * Batas angkanya disalin dari backend dan HARUS sama dengannya — kalau di sini
 * lebih longgar, isian lolos di layar lalu ditolak saat disimpan.
 */

/** Sama dengan MAKS_* di QuotationController. */
export const MAKS_GRUP = 20;
export const MAKS_ITEM = 200;
export const MAKS_GAMBAR = 6;
export const MAKS_REVISI = 99;

/** Panjang kolom VARCHAR(191) di tabel quotation. */
const MAKS_TEKS = 191;

/**
 * Angka dari form bisa datang sebagai number (NumericFormat) atau string
 * numerik (respons backend untuk kolom DECIMAL: `"1250000.00"`). Yang bukan
 * angka diteruskan apa adanya supaya zod yang melaporkan tipenya salah.
 */
const keAngka = (nilai: unknown) => {
  if (typeof nilai === "number") return nilai;

  if (typeof nilai === "string") {
    const bersih = nilai.trim();
    if (bersih === "") return 0;

    const n = Number(bersih);
    return Number.isFinite(n) ? n : nilai;
  }

  if (nilai === null || nilai === undefined) return 0;

  return nilai;
};

const angka = (pesan: string) => z.preprocess(keAngka, z.number(pesan));

const persen = (label: string) =>
  angka(`${label} harus berupa angka`)
    .refine((n) => n >= 0, `${label} tidak boleh negatif`)
    .refine((n) => n <= 100, `${label} maksimal 100%`);

const teksOpsional = (maks: number, label: string) =>
  z.string().trim().max(maks, `${label} maksimal ${maks} karakter`);

/** "YYYY-MM-DD" dari `<input type="date">`; kosong berarti belum diisi. */
const tanggal = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`);

const skemaGambar = z.object({
  uuid: z.string().min(1),
  nama_asli: z.string(),
});

const skemaItem = z
  .object({
    judul: z.boolean(),

    deskripsi: z
      .string()
      .trim()
      .min(1, "Uraian item wajib diisi")
      .max(1000, "Uraian item maksimal 1000 karakter"),

    // `?? ""` di komponen membuat nilainya tidak pernah null saat diketik, tapi
    // item dari backend bisa membawa null — keduanya diterima, keluar sebagai "".
    satuan: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (v ?? "").trim())
      .refine(
        (v) => v.length <= MAKS_TEKS,
        `Satuan maksimal ${MAKS_TEKS} karakter`,
      ),

    qty: angka("Qty harus berupa angka"),

    harga: angka("Harga harus berupa angka"),

    diskon_persen: persen("Diskon item"),

    kena_pph: z.boolean(),

    gambar: z
      .array(skemaGambar)
      .max(MAKS_GAMBAR, `Maksimal ${MAKS_GAMBAR} gambar per item`)
      .default([]),
  })
  // Batas qty/harga dipindah ke tingkat OBJEK, bukan menempel di fieldnya,
  // karena keduanya cuma berlaku untuk baris barang. Baris judul tidak punya
  // qty maupun harga — menuntutnya "lebih dari 0" akan menolak judul yang
  // sempurna sah, dan pesannya muncul di kolom yang bahkan tidak ditampilkan.
  .refine((d) => d.judul || d.qty > 0, {
    path: ["qty"],
    error: "Qty harus lebih dari 0",
  })
  .refine((d) => d.judul || d.harga >= 0, {
    path: ["harga"],
    error: "Harga tidak boleh negatif",
  });

const skemaGrup = z.object({
  nama: z
    .string()
    .trim()
    .min(1, "Nama grup wajib diisi")
    .max(MAKS_TEKS, `Nama grup maksimal ${MAKS_TEKS} karakter`),

  item: z
    .array(skemaItem)
    .min(1, "Grup ini belum punya item")
    .max(MAKS_ITEM, `Item maksimal ${MAKS_ITEM} baris`)
    // Grup yang isinya judul semua tidak menawarkan apa pun — hampir selalu
    // centang yang lupa dicabut, bukan maksud sebenarnya. Backend menolak hal
    // yang sama; ini cuma supaya ketahuannya sebelum dikirim.
    .refine((item) => item.some((b) => !b.judul), {
      error: "Grup ini cuma berisi judul, belum ada itemnya",
    }),
});

export const skemaQuotation = z
  .object({
    customer_id: z.preprocess(
      (v) =>
        v === "" || v === null || v === undefined ? undefined : keAngka(v),
      z
        .number("Customer wajib dipilih")
        .refine((n) => n > 0, "Customer wajib dipilih"),
    ),

    // Diisi user, bukan dihitung sistem: yang menentukan sebuah penawaran itu
    // "revisi ke-2" adalah kesepakatan dengan customer di luar aplikasi, dan
    // sering sudah terlanjur disebut begitu di email sebelum datanya masuk ke
    // sini. Nol berarti bukan revisi.
    revisi: angka("Revisi harus berupa angka")
      .refine((n) => Number.isInteger(n), "Revisi harus bilangan bulat")
      .refine((n) => n >= 0, "Revisi tidak boleh negatif")
      .refine((n) => n <= MAKS_REVISI, `Revisi maksimal ${MAKS_REVISI}`),

    tanggal: tanggal("Tanggal"),
    berlaku_sampai: tanggal("Berlaku sampai"),

    attn: teksOpsional(MAKS_TEKS, "Attention"),

    perihal: z
      .string()
      .trim()
      .min(3, "Perihal minimal 3 karakter")
      .max(MAKS_TEKS, `Perihal maksimal ${MAKS_TEKS} karakter`),

    syarat_pembayaran: teksOpsional(5000, "Syarat & ketentuan"),
    catatan: teksOpsional(5000, "Catatan"),

    diskon_persen: persen("Diskon"),
    ppn_persen: persen("PPN"),
    pph_persen: persen("PPh"),

    pph_dasar: z.enum(["item", "total"], "Dasar PPh harus item atau total"),

    tampilkan_grand_total: z.boolean(),

    // Daftar tertutup, bukan teks bebas: nilainya jadi awalan nominal di PDF,
    // dan salah ketik di situ mengubah arti angka pada dokumen yang sudah
    // terlanjur dikirim ke customer.
    currency: z.enum(
      ["IDR", "USD", "SGD"],
      "Mata uang harus IDR, USD, atau SGD",
    ),

    grup: z
      .array(skemaGrup)
      .min(1, "Quotation minimal punya satu grup item")
      .max(MAKS_GRUP, `Grup maksimal ${MAKS_GRUP}`),
  })
  // Masa berlaku yang mendahului tanggal penawaran membuat dokumennya
  // kadaluarsa sejak menit pertama — hampir selalu salah ketik.
  .refine(
    (d) => !d.tanggal || !d.berlaku_sampai || d.berlaku_sampai >= d.tanggal,
    {
      path: ["berlaku_sampai"],
      error: "Berlaku sampai tidak boleh lebih awal dari tanggal quotation",
    },
  )
  // Batas 200 item berlaku untuk SELURUH penawaran, bukan per grup.
  .refine((d) => d.grup.reduce((t, g) => t + g.item.length, 0) <= MAKS_ITEM, {
    path: ["grup"],
    error: `Item quotation maksimal ${MAKS_ITEM} baris`,
  });

export type QuotationInput = z.infer<typeof skemaQuotation>;

/**
 * Nomor penawaran → segmen URL: `001/QUO/PJ/IX/2026` → `001-QUO-PJ-IX-2026`.
 *
 * Dipakai untuk tautan PDF, yang dikunci nomor dan bukan id karena tautannya
 * terlihat orang — muncul di address bar, disalin ke chat, jadi nama berkas
 * unduhan.
 *
 * Garis miringnya diganti strip, BUKAN di-`encodeURIComponent`: `%2F` di dalam
 * path ditolak sebagian proxy dan dinormalkan sebagian yang lain, jadi
 * tautannya akan hidup-mati tergantung apa yang berdiri di depan aplikasi.
 * Backend mencocokkan ke arah sebaliknya (`REPLACE`), jadi penggantian ini
 * tidak perlu bisa dibalik.
 *
 * SPASI ikut jadi strip, bukan dibuang. Empat nomor hasil impor sistempanji
 * memuat spasi di segmen kode customer (`PJ-Q-BRI KCP-24-0068`); membuangnya
 * menghasilkan `PJ-Q-BRIKCP-…` yang tidak cocok dengan `REPLACE` di backend,
 * dan keempat dokumen itu tidak akan pernah bisa dicetak.
 */
export const nomorKeSlug = (nomor: string) =>
  nomor
    .trim()
    .replace(/[/\s]+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "");

/** Tautan PDF satu penawaran. `unduh` memaksa download, bukan buka di tab. */
export const tautanPdf = (nomor: string, unduh = false) =>
  `/api/sales/quotation/${nomorKeSlug(nomor)}/pdf${unduh ? "?unduh=1" : ""}`;

/**
 * Nominal + mata uangnya, satu-satunya pemformat uang di modul ini.
 *
 * Sengaja dipusatkan: sebelumnya tiga komponen memegang salinan `Intl`-nya
 * sendiri yang sama persis, dan begitu mata uang berhenti selalu IDR ketiganya
 * harus diubah berbarengan — yang terlewat satu akan mencetak "Rp" di atas
 * angka dolar tanpa ada yang menyadarinya.
 *
 * Locale mengikuti mata uang, bukan selalu id-ID: "US$ 1.250,50" gaya Indonesia
 * salah baca sejuta kali lipat bagi pembaca yang memang memakai dolar.
 */
const LOCALE: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  SGD: "en-SG",
};

export const uang = (nilai: number, currency: string = "IDR") => {
  const kode = (currency || "IDR").toUpperCase();
  const n = Number.isFinite(nilai) ? nilai : 0;

  return new Intl.NumberFormat(LOCALE[kode] ?? "en-US", {
    style: "currency",
    currency: kode,
    // Pecahan ditampilkan hanya kalau memang ada. Penawaran rupiah hampir
    // selalu bulat, dan ",00" di tiap baris cuma kebisingan; penawaran dolar
    // justru sering bersen, dan membulatkannya menyembunyikan selisih.
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
};

/**
 * Pesan kesalahan, dikunci path: `"perihal"`, `"grup.0.nama"`,
 * `"grup.0.item.2.qty"`. Pakai `kunciGrup()` / `kunciItem()` untuk membacanya.
 */
export type ErrorForm = Record<string, string>;

export const kunciGrup = (gi: number) => `grup.${gi}.nama`;

export const kunciItem = (
  gi: number,
  ii: number,
  field: "deskripsi" | "satuan" | "qty" | "harga" | "diskon_persen" | "gambar",
) => `grup.${gi}.item.${ii}.${field}`;

/**
 * Validasi satu objek form. Mengembalikan data yang sudah di-trim bila lolos,
 * atau peta error per path bila tidak.
 *
 * Hanya error PERTAMA tiap path yang disimpan — satu field cuma punya satu
 * baris pesan di bawahnya, dan menumpuk beberapa pesan di situ membuat
 * layoutnya melompat.
 */
export function validasiQuotation(
  nilai: unknown,
):
  { sukses: true; data: QuotationInput } | { sukses: false; error: ErrorForm } {
  const hasil = skemaQuotation.safeParse(nilai);

  if (hasil.success) {
    return { sukses: true, data: hasil.data };
  }

  const error: ErrorForm = {};

  for (const issue of hasil.error.issues) {
    const kunci = issue.path.join(".");
    if (!error[kunci]) {
      error[kunci] = issue.message;
    }
  }

  return { sukses: false, error };
}

/**
 * Satu pesan untuk ditaruh di alert atas form.
 *
 * Error item berada di dalam tabel yang bisa sepanjang layar; tanpa ini user
 * cuma melihat "Periksa kembali isian form" tanpa tahu harus menggulir ke mana.
 * Path diterjemahkan jadi posisi yang bisa dibaca ("Grup 2, item 3").
 *
 * `pakaiGrup` false = penawaran satu grup, dan di layar konsep grupnya memang
 * tidak ditampilkan — menyebut "Grup 1" di situ menunjuk sesuatu yang tidak ada
 * di layar.
 */
export function ringkasError(error: ErrorForm, pakaiGrup = true): string {
  const kunci = Object.keys(error)[0];

  if (!kunci) return "";

  const item = kunci.match(/^grup\.(\d+)\.item\.(\d+)\./);

  if (item) {
    const posisi = `item ${Number(item[2]) + 1}`;

    return pakaiGrup
      ? `Grup ${Number(item[1]) + 1}, ${posisi}: ${error[kunci]}`
      : `Item ${Number(item[2]) + 1}: ${error[kunci]}`;
  }

  const grup = kunci.match(/^grup\.(\d+)\./);

  if (grup) {
    return pakaiGrup
      ? `Grup ${Number(grup[1]) + 1}: ${error[kunci]}`
      : error[kunci];
  }

  return error[kunci];
}
