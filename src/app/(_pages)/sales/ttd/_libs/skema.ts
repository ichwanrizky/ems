import { z } from "zod";

/**
 * Validasi form tanda tangan.
 *
 * Dipakai DUA kali untuk satu submit: di komponen supaya kesalahan muncul di
 * bawah fieldnya tanpa perjalanan ke server, dan di server action sebagai
 * gerbang terakhir sebelum request dikirim ke backend. Sengaja berkas
 * tersendiri — kalau skemanya ikut di komponen, `action.ts` (yang "use server")
 * akan menarik seluruh komponen client itu ke bundel server.
 *
 * Gambarnya TIDAK divalidasi di sini. Ia bukan string di formData melainkan
 * Blob yang diunggah lebih dulu, dan yang menentukan sah atau tidak adalah
 * backend — yang membaca ISI berkasnya, bukan namanya.
 */

export const skemaTtd = z.object({
  nama: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter"),

  // Boleh kosong: sebagian penanda tangan cukup dikenal dengan namanya saja,
  // dan PDF memang melewati barisnya kalau tidak diisi.
  jabatan: z.string().trim().max(100, "Jabatan maksimal 100 karakter"),
});

export type TtdInput = z.infer<typeof skemaTtd>;

/** Pesan kesalahan per field: `{ nama: "Nama minimal 2 karakter", ... }`. */
export type ErrorForm = Partial<Record<keyof TtdInput | "gambar", string>>;

/**
 * Validasi satu objek form. Mengembalikan data yang sudah di-trim bila lolos,
 * atau peta error per field bila tidak.
 *
 * Hanya error PERTAMA tiap field yang disimpan — satu field cuma punya satu
 * baris pesan di bawahnya, dan menumpuk beberapa pesan di situ justru membuat
 * layoutnya melompat.
 */
export function validasiTtd(nilai: unknown):
  | { sukses: true; data: TtdInput }
  | { sukses: false; error: ErrorForm } {
  const hasil = skemaTtd.safeParse(nilai);

  if (hasil.success) {
    return { sukses: true, data: hasil.data };
  }

  const error: ErrorForm = {};

  for (const issue of hasil.error.issues) {
    const field = issue.path[0] as keyof TtdInput | undefined;
    if (field && !error[field]) {
      error[field] = issue.message;
    }
  }

  return { sukses: false, error };
}
