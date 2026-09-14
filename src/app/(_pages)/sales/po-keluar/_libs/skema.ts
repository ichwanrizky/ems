import { nomorKeSlug, uang } from "@/libs/Dokumen";
import { z } from "zod";

/**
 * Validasi form PO Keluar.
 *
 * Dipakai DUA kali untuk satu submit: di `PoKeluarForm` supaya kesalahan muncul
 * di bawah fieldnya tanpa perjalanan ke server, dan di server action sebagai
 * gerbang terakhir. Berkas tersendiri karena `action.ts` ber-"use server" —
 * mengimpor skema dari komponen client akan menarik komponen itu ke bundel
 * server.
 *
 * Ini TIDAK menggantikan validasi backend; lihat `PoKeluarController`. Yang di
 * sini cuma mempercepat ketahuannya salah ketik, dan membuat pesannya menempel
 * di baris item yang benar — pesan tunggal dari backend ("Qty baris ke-3 harus
 * lebih dari 0") tetap mengharuskan user menghitung barisnya sendiri.
 *
 * ## Error bersarang
 *
 * Itemnya daftar, bukan sederet field datar, jadi peta errornya dikunci PATH
 * (`item.2.qty`) dan komponen mengambilnya lewat `kunciItem()` supaya penulisan
 * kuncinya tidak tersebar sebagai string literal.
 *
 * Sarangnya SATU tingkat, bukan dua seperti quotation (`grup.0.item.2.qty`):
 * PO tidak punya grup — ia perintah beli, dan semua barisnya dibeli, jadi tidak
 * ada pilihan paket yang perlu dipisahkan.
 *
 * Batas angkanya disalin dari backend dan HARUS sama dengannya — kalau di sini
 * lebih longgar, isian lolos di layar lalu ditolak saat disimpan.
 */

/** Sama dengan MAKS_* di PoKeluarController. */
export const MAKS_ITEM = 200;
export const MAKS_REVISI = 99;

/** Panjang kolom VARCHAR(191). */
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
const tanggalWajib = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`);

/** Tanggal boleh kosong — sebagian PO jasa tidak punya tanggal kirim tunggal. */
const tanggalOpsional = (label: string) =>
  z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} tidak valid`),
  ]);

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

    remarks: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (v ?? "").trim())
      .refine(
        (v) => v.length <= MAKS_TEKS,
        `Remarks maksimal ${MAKS_TEKS} karakter`,
      ),

    qty: angka("Qty harus berupa angka"),

    harga: angka("Harga harus berupa angka"),

    diskon_persen: persen("Diskon item"),

    kena_pph: z.boolean(),
  })
  // Batas qty/harga dipindah ke tingkat OBJEK, bukan menempel di fieldnya,
  // karena keduanya cuma berlaku untuk baris barang. Baris judul tidak punya
  // qty maupun harga — menuntutnya "lebih dari 0" akan menolak judul yang
  // sempurna sah, dan pesannya muncul di kolom yang bahkan tidak ditampilkan.
  //
  // Harga NEGATIF sengaja TIDAK diperiksa di sini, berbeda dari skema
  // quotation. Baris potongan ("Discount", "Potongan sample") ditulis sebagai
  // item berharga minus di PO lama dan memang mengurangi tagihan — satu baris
  // seperti itu ada di data impor sistempanji. Menolaknya berarti PO itu tidak
  // bisa disunting sama sekali tanpa mengubah isinya lebih dulu. Backend pun
  // menerimanya; lihat `kolomItem()` di PoKeluarController.
  .refine((d) => d.judul || d.qty > 0, {
    path: ["qty"],
    error: "Qty harus lebih dari 0",
  });

export const skemaPoKeluar = z
  .object({
    customer_id: z.preprocess(
      (v) =>
        v === "" || v === null || v === undefined ? undefined : keAngka(v),
      z
        .number("Supplier wajib dipilih")
        .refine((n) => n > 0, "Supplier wajib dipilih"),
    ),

    // Diisi user, bukan dihitung sistem: PO yang direvisi biasanya sudah
    // disebut begitu lewat telepon sebelum datanya masuk ke sini. Nol berarti
    // bukan revisi.
    revisi: angka("Revisi harus berupa angka")
      .refine((n) => Number.isInteger(n), "Revisi harus bilangan bulat")
      .refine((n) => n >= 0, "Revisi tidak boleh negatif")
      .refine((n) => n <= MAKS_REVISI, `Revisi maksimal ${MAKS_REVISI}`),

    tanggal: tanggalWajib("Tanggal"),
    tanggal_kirim: tanggalOpsional("Tanggal kirim"),

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

    // Daftar tertutup, bukan teks bebas: nilainya jadi awalan nominal di PDF,
    // dan salah ketik di situ mengubah arti angka pada dokumen yang sudah
    // terlanjur dikirim ke supplier.
    currency: z.enum(
      ["IDR", "USD", "SGD"],
      "Mata uang harus IDR, USD, atau SGD",
    ),

    // Penanda tangan — OPSIONAL, jadi kosong dipetakan ke 0 dan bukan ditolak.
    // PO lama tidak punya, dan sebagian memang sengaja diteken basah. Backend
    // memperlakukan 0 sama dengan "tidak dipilih".
    ttd_id: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? 0 : keAngka(v)),
      z
        .number("Tanda tangan tidak sah")
        .refine((n) => Number.isInteger(n) && n >= 0, "Tanda tangan tidak sah"),
    ),

    item: z
      .array(skemaItem)
      .min(1, "PO minimal punya satu item")
      .max(MAKS_ITEM, `Item maksimal ${MAKS_ITEM} baris`)
      // PO yang isinya judul semua tidak memesan apa pun — hampir selalu
      // centang yang lupa dicabut, bukan maksud sebenarnya. Backend menolak hal
      // yang sama; ini cuma supaya ketahuannya sebelum dikirim.
      .refine((item) => item.some((b) => !b.judul), {
        error: "PO ini cuma berisi judul, belum ada itemnya",
      }),
  })
  // Tanggal kirim yang mendahului tanggal PO meminta barang datang sebelum
  // pesanannya dibuat — hampir selalu salah ketik.
  .refine(
    (d) => !d.tanggal || !d.tanggal_kirim || d.tanggal_kirim >= d.tanggal,
    {
      path: ["tanggal_kirim"],
      error: "Tanggal kirim tidak boleh lebih awal dari tanggal PO",
    },
  );

export type PoKeluarInput = z.infer<typeof skemaPoKeluar>;

/**
 * `uang()` dan `nomorKeSlug()` diteruskan dari `@/libs/Dokumen` — sama seperti
 * di modul quotation, supaya pemformat uangnya cuma ada SATU di seluruh modul
 * Sales. Lihat catatan panjang di berkas itu untuk alasannya.
 */
export { nomorKeSlug, uang };

/** Tautan PDF satu PO. `unduh` memaksa download, bukan buka di tab. */
export const tautanPdf = (nomor: string, unduh = false) =>
  `/api/sales/po-keluar/${nomorKeSlug(nomor)}/pdf${unduh ? "?unduh=1" : ""}`;

/**
 * Pesan kesalahan, dikunci path: `"perihal"`, `"item.2.qty"`. Pakai
 * `kunciItem()` untuk membacanya.
 */
export type ErrorForm = Record<string, string>;

export const kunciItem = (
  ii: number,
  field: "deskripsi" | "satuan" | "qty" | "harga" | "diskon_persen" | "remarks",
) => `item.${ii}.${field}`;

/**
 * Validasi satu objek form. Mengembalikan data yang sudah di-trim bila lolos,
 * atau peta error per path bila tidak.
 *
 * Hanya error PERTAMA tiap path yang disimpan — satu field cuma punya satu
 * baris pesan di bawahnya, dan menumpuk beberapa pesan di situ membuat
 * layoutnya melompat.
 */
export function validasiPoKeluar(
  nilai: unknown,
): { sukses: true; data: PoKeluarInput } | { sukses: false; error: ErrorForm } {
  const hasil = skemaPoKeluar.safeParse(nilai);

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
 * Path diterjemahkan jadi posisi yang bisa dibaca ("Item 3").
 */
export function ringkasError(error: ErrorForm): string {
  const kunci = Object.keys(error)[0];

  if (!kunci) return "";

  const item = kunci.match(/^item\.(\d+)\./);

  if (item) {
    return `Item ${Number(item[1]) + 1}: ${error[kunci]}`;
  }

  return error[kunci];
}
