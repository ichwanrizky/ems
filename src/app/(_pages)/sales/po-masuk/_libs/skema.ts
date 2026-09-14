import { z } from "zod";

/**
 * Validasi form PO Masuk.
 *
 * Dipakai DUA kali untuk satu submit: di komponen supaya kesalahan muncul di
 * bawah fieldnya tanpa perjalanan ke server, dan di server action sebagai
 * gerbang terakhir. Berkas tersendiri karena `action.ts` ber-"use server" —
 * mengimpor skema dari komponen client akan menarik komponen itu ke bundel
 * server.
 *
 * Ini TIDAK menggantikan validasi backend; lihat `PoMasukController`. Backend
 * yang memegang keunikan nomor dan yang memeriksa quotation-nya benar milik
 * customer yang dipilih — dua hal yang tidak bisa diketahui dari form saja.
 *
 * Batas angkanya disalin dari backend dan HARUS sama dengannya — kalau di sini
 * lebih longgar, isian lolos di layar lalu ditolak saat disimpan.
 */

/** Sama dengan MAKS_BERKAS di PoMasukController. */
export const MAKS_BERKAS = 6;

/** Panjang kolom VARCHAR(191). */
const MAKS_TEKS = 191;

/**
 * Angka dari form bisa datang sebagai number (NumericFormat) atau string
 * numerik. Yang bukan angka diteruskan apa adanya supaya zod yang melaporkan
 * tipenya salah.
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

const teksOpsional = (maks: number, label: string) =>
  z.string().trim().max(maks, `${label} maksimal ${maks} karakter`);

/** "YYYY-MM-DD" dari `<input type="date">`; kosong berarti belum diisi. */
const tanggal = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`);

const skemaBerkas = z.object({
  uuid: z.string().min(1),
  nama_asli: z.string(),
  tipe: z.string(),
  ukuran: z.number(),
});

export const skemaPoMasuk = z.object({
  // Nomor MILIK CUSTOMER, diketik apa adanya. Sengaja tanpa pola: nomor PO tiap
  // perusahaan berbeda bentuknya — ada yang murni digit sepuluh karakter
  // (`2203674020`), ada yang bergaris miring, ada yang berspasi. Memaksakan
  // satu pola di sini berarti sebagian PO yang sah tidak bisa dicatat.
  nomor: z
    .string()
    .trim()
    .min(2, "Nomor PO minimal 2 karakter")
    .max(MAKS_TEKS, `Nomor PO maksimal ${MAKS_TEKS} karakter`),

  tanggal: tanggal("Tanggal PO"),

  customer_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : keAngka(v)),
    z
      .number("Customer wajib dipilih")
      .refine((n) => n > 0, "Customer wajib dipilih"),
  ),

  // OPSIONAL: PO yang datang tanpa penawaran itu hal biasa (pesanan ulang,
  // pengadaan kecil). Memaksa setiap PO menunjuk penawaran cuma membuat orang
  // mengarang kaitan supaya formnya bisa disimpan.
  quotation_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : keAngka(v)),
    z.union([z.null(), z.number("Quotation tidak valid")]),
  ),

  perihal: teksOpsional(MAKS_TEKS, "Perihal"),
  requestor: teksOpsional(MAKS_TEKS, "Requestor"),

  // NILAI dibedakan dari nol, jadi bentuknya "" atau angka — bukan angka dengan
  // default 0. Sebagian PO memang datang tanpa nominal (rate card, pesanan
  // bertahap), dan nol yang dipaksakan terbaca sebagai "PO senilai nol".
  nilai: z.union([
    z.literal(""),
    z
      .number("Nilai PO harus berupa angka")
      .refine((n) => n >= 0, "Nilai PO tidak boleh negatif"),
  ]),

  // Daftar tertutup, bukan teks bebas — nilainya jadi awalan nominal di daftar.
  currency: z.enum(["IDR", "USD", "SGD"], "Mata uang harus IDR, USD, atau SGD"),

  catatan: teksOpsional(5000, "Catatan"),

  // Berkasnya WAJIB. Baris tanpa berkas adalah catatan tentang dokumen yang
  // tidak ada di sini — dan yang menaruhnya hampir tidak pernah kembali untuk
  // melengkapinya. Isi PO masuk memang cuma berkasnya.
  berkas: z
    .array(skemaBerkas)
    .min(1, "Berkas PO wajib diunggah")
    .max(MAKS_BERKAS, `Maksimal ${MAKS_BERKAS} berkas`),
});

export type PoMasukInput = z.infer<typeof skemaPoMasuk>;

/** Pesan kesalahan per field. */
export type ErrorForm = Partial<Record<keyof PoMasukInput, string>>;

/**
 * Validasi satu objek form. Mengembalikan data yang sudah di-trim bila lolos,
 * atau peta error per field bila tidak.
 *
 * Hanya error PERTAMA tiap field yang disimpan — satu field cuma punya satu
 * baris pesan di bawahnya, dan menumpuk beberapa pesan di situ membuat
 * layoutnya melompat.
 */
export function validasiPoMasuk(
  nilai: unknown,
): { sukses: true; data: PoMasukInput } | { sukses: false; error: ErrorForm } {
  const hasil = skemaPoMasuk.safeParse(nilai);

  if (hasil.success) {
    return { sukses: true, data: hasil.data };
  }

  const error: ErrorForm = {};

  for (const issue of hasil.error.issues) {
    const field = issue.path[0] as keyof PoMasukInput | undefined;
    if (field && !error[field]) {
      error[field] = issue.message;
    }
  }

  return { sukses: false, error };
}

/**
 * Tautan berkas arsip. `unduh` memaksa download, bukan buka di tab.
 *
 * Lewat route Next, bukan langsung ke backend: berkasnya ada di luar document
 * root backend dan tokennya sengaja tidak pernah sampai ke browser.
 */
export const tautanBerkas = (uuid: string, unduh = false) =>
  `/api/sales/po-masuk/berkas/${uuid}${unduh ? "?unduh=1" : ""}`;

/**
 * Ikon Font Awesome untuk satu MIME.
 *
 * Dipakai di daftar, tempat tiap baris menampilkan berkasnya sebagai tautan.
 * Bentuk berkasnya dikenali sekilas dari ikon — dan yang paling berarti di sini
 * adalah membedakan PDF (mayoritas) dari scan gambar, karena yang kedua sering
 * berarti ada beberapa halaman terpisah.
 */
export const ikonBerkas = (tipe: string) => {
  if (tipe === "application/pdf") return "fas fa-file-pdf text-danger";
  if (tipe.startsWith("image/")) return "fas fa-file-image text-primary";
  if (tipe.includes("word")) return "fas fa-file-word text-primary";
  if (tipe.includes("sheet") || tipe.includes("excel"))
    return "fas fa-file-excel text-success";

  return "fas fa-file text-muted";
};

/** "1536000" → "1,5 MB". Dipakai di daftar berkas pada form dan detail. */
export const ukuranBerkas = (byte: number) => {
  if (!Number.isFinite(byte) || byte <= 0) return "";

  const kb = byte / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;

  return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
};
