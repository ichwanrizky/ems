import { z } from "zod";

/**
 * Validasi form customer.
 *
 * Dipakai DUA kali untuk satu submit: di komponen supaya kesalahan muncul di
 * bawah fieldnya tanpa perjalanan ke server, dan di server action sebagai
 * gerbang terakhir sebelum request dikirim ke backend. Sengaja berkas
 * tersendiri — kalau skemanya ikut di komponen, `action.ts` (yang "use server")
 * akan menarik seluruh komponen client itu ke bundel server.
 *
 * Ini TIDAK menggantikan validasi backend. Backend tetap satu-satunya yang
 * menentukan sah atau tidak — ia yang memegang keunikan kode dan dipanggil juga
 * oleh hal lain di luar form ini. Yang di sini cuma membuat kesalahan ketik
 * ketahuan lebih cepat dan pesannya menempel di field yang benar.
 */

/** Field opsional: string kosong sah, dan dikirim apa adanya. */
const opsional = (maks: number, label: string) =>
  z.string().trim().max(maks, `${label} maksimal ${maks} karakter`);

export const skemaCustomer = z.object({
  // Kode ikut ke nomor dokumen dan dibaca orang, jadi dibatasi ke bentuk yang
  // aman dipakai di mana pun: huruf, angka, titik, dan strip.
  kode: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(
      /^[A-Za-z0-9.\-]+$/,
      "Kode hanya boleh huruf, angka, titik, dan strip"
    ),

  nama_customer: z
    .string()
    .trim()
    .min(3, "Nama customer minimal 3 karakter")
    .max(150, "Nama customer maksimal 150 karakter"),

  alamat: opsional(500, "Alamat"),
  telp: opsional(30, "Telp"),

  // `z.email()` menolak string kosong, padahal email boleh tidak diisi — jadi
  // kosong diterima lewat cabang tersendiri, bukan dengan `.optional()`
  // (fieldnya selalu terkirim, cuma isinya yang mungkin kosong).
  email: z.union([
    z.literal(""),
    z.email("Format email tidak valid").max(100, "Email maksimal 100 karakter"),
  ]),
});

export type CustomerInput = z.infer<typeof skemaCustomer>;

/** Pesan kesalahan per field: `{ kode: "Kode wajib diisi", ... }`. */
export type ErrorForm = Partial<Record<keyof CustomerInput, string>>;

/**
 * Validasi satu objek form. Mengembalikan data yang sudah di-trim bila lolos,
 * atau peta error per field bila tidak.
 *
 * Hanya error PERTAMA tiap field yang disimpan — satu field cuma punya satu
 * baris pesan di bawahnya, dan menumpuk beberapa pesan di situ justru membuat
 * layoutnya melompat.
 */
export function validasiCustomer(nilai: unknown):
  | { sukses: true; data: CustomerInput }
  | { sukses: false; error: ErrorForm } {
  const hasil = skemaCustomer.safeParse(nilai);

  if (hasil.success) {
    return { sukses: true, data: hasil.data };
  }

  const error: ErrorForm = {};

  for (const issue of hasil.error.issues) {
    const field = issue.path[0] as keyof CustomerInput | undefined;
    if (field && !error[field]) {
      error[field] = issue.message;
    }
  }

  return { sukses: false, error };
}
