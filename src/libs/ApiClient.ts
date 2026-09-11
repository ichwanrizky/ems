import "server-only";

import { authOptions } from "@/libs/AuthOptions";
import { getServerSession } from "next-auth";

/**
 * Klien HTTP ke service `ems-backend` (PHP/Slim).
 *
 * Ini satu-satunya tempat aplikasi ini bicara ke backend. Seluruh
 * `_libs/action.ts` memanggil helper di sini, bukan Prisma — tanda tangan
 * fungsi server action-nya sengaja tidak berubah supaya komponen `*View.tsx`
 * tidak perlu disentuh sama sekali.
 *
 * Kontrak responsnya sama dengan yang dulu dikembalikan server action:
 *
 *   { status: boolean; message: string; data?: T; total_data?: number }
 *
 * Jadi pemanggil yang sudah ada tetap jalan apa adanya.
 *
 * ## Token
 *
 * Endpoint dashboard di backend dijaga JWT. Tokennya diterbitkan backend saat
 * login dan dititipkan di session NextAuth (lihat `AuthOptions.tsx`), lalu
 * diambil di sini lewat `getServerSession`. Semua pemanggilan terjadi di
 * server — token tidak pernah sampai ke browser.
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export type ApiResult<T = any> = {
  status: boolean;
  message: string;
  data?: T;
  total_data?: number;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Query string; nilai null/undefined/"" dibuang. */
  query?: Record<string, any>;
  /** Body JSON; dibuang untuk GET. */
  body?: Record<string, any>;
  /** Lewati penyisipan token (endpoint publik di backend). */
  tanpaToken?: boolean;
  /**
   * Detik cache Next.js. Default 0 (selalu segar) — data EMS berubah terus dan
   * halamannya menampilkan angka absensi/gaji yang tidak boleh basi.
   */
  revalidate?: number;
};

/** Pesan seragam saat backend tidak bisa dihubungi sama sekali. */
const PESAN_GAGAL_KONEKSI =
  "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

function buildUrl(path: string, query?: Record<string, any>): string {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  if (!query) return url;

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      // Array dikirim sebagai JSON supaya bentuknya sama dengan body —
      // Support\Req::daftar() di backend menerima keduanya.
      params.append(key, JSON.stringify(value));
      return;
    }

    params.append(key, String(value));
  });

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Panggil backend. TIDAK pernah melempar: kegagalan apa pun dikembalikan
 * sebagai `{status:false, message}` supaya komponen yang sudah ada — yang
 * hanya mengecek `result.status` — tidak perlu tahu bedanya error jaringan
 * dan error validasi.
 */
export async function apiFetch<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const { method = "GET", query, body, tanpaToken = false, revalidate = 0 } = options;

  if (!BASE_URL) {
    console.error("BACKEND_URL belum diset di environment.");
    return { status: false, message: "Konfigurasi server belum lengkap" };
  }

  const headers: Record<string, string> = { Accept: "application/json" };

  if (!tanpaToken) {
    const token = await getAccessToken();

    if (!token) {
      return { status: false, message: "Sesi berakhir, silakan login ulang" };
    }

    headers.Authorization = `Bearer ${token}`;
  }

  if (body && method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body && method !== "GET" ? JSON.stringify(body) : undefined,
      next: { revalidate },
    });

    const teks = await response.text();

    let hasil: ApiResult<T>;
    try {
      hasil = JSON.parse(teks);
    } catch {
      // Backend selalu membalas JSON; kalau bukan, yang menjawab biasanya
      // proxy/gateway di depannya (502/504 berbentuk HTML).
      console.error(`Respons non-JSON dari ${path} (${response.status}): ${teks.slice(0, 300)}`);
      return { status: false, message: PESAN_GAGAL_KONEKSI };
    }

    if (typeof hasil?.status !== "boolean") {
      return { status: false, message: "Respons server tidak dikenali" };
    }

    return hasil;
  } catch (error) {
    console.error(`Gagal memanggil ${path}:`, error);
    return { status: false, message: PESAN_GAGAL_KONEKSI };
  }
}

/**
 * `Date` → "YYYY-MM-DD" memakai komponen LOKAL, bukan UTC.
 *
 * Jangan pakai `toISOString().split("T")[0]` untuk ini. Date picker memberi
 * tengah malam waktu lokal (WIB); `toISOString()` mengubahnya jadi 17:00 UTC
 * HARI SEBELUMNYA, sehingga tanggal yang dikirim mundur satu hari — absen 1
 * September tercatat 31 Agustus.
 */
export async function tanggalLokal(
  nilai: Date | string | null | undefined
): Promise<string | undefined> {
  if (!nilai) return undefined;

  const tanggal = nilai instanceof Date ? nilai : new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return undefined;

  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");

  return `${tanggal.getFullYear()}-${bulan}-${hari}`;
}

/**
 * `Date` → "HH:MM" memakai komponen LOKAL. Dipakai untuk jam shift dan jam
 * lembur yang di form berbentuk Date.
 */
export async function jamLokal(
  nilai: Date | string | null | undefined
): Promise<string | undefined> {
  if (!nilai) return undefined;

  const waktu = nilai instanceof Date ? nilai : new Date(nilai);
  if (Number.isNaN(waktu.getTime())) return undefined;

  return `${String(waktu.getHours()).padStart(2, "0")}:${String(
    waktu.getMinutes()
  ).padStart(2, "0")}`;
}

/** Token backend milik user yang sedang login. */
export async function getAccessToken(): Promise<string | null> {
  const session: any = await getServerSession(authOptions);
  return session?.user?.accessToken ?? null;
}

// ---------------------------------------------------------------------------
// Pintasan
// ---------------------------------------------------------------------------

export const apiGet = <T = any>(path: string, query?: Record<string, any>) =>
  apiFetch<T>(path, { method: "GET", query });

export const apiPost = <T = any>(path: string, body?: Record<string, any>) =>
  apiFetch<T>(path, { method: "POST", body });

export const apiPut = <T = any>(path: string, body?: Record<string, any>) =>
  apiFetch<T>(path, { method: "PUT", body });

export const apiPatch = <T = any>(path: string, body?: Record<string, any>) =>
  apiFetch<T>(path, { method: "PATCH", body });

export const apiDelete = <T = any>(path: string, query?: Record<string, any>) =>
  apiFetch<T>(path, { method: "DELETE", query });

/**
 * Untuk endpoint list: pastikan `data` selalu array dan `total_data` selalu
 * angka, apa pun yang terjadi. Halaman list memanggil `.map()` langsung di
 * hasilnya, jadi `data: undefined` saat error akan melempar di render.
 */
export async function apiList<T = any>(
  path: string,
  query?: Record<string, any>
): Promise<{ status: boolean; message: string; data: T[]; total_data: number }> {
  const hasil = await apiGet<T[]>(path, query);

  return {
    status: hasil.status,
    message: hasil.message,
    data: Array.isArray(hasil.data) ? hasil.data : [],
    total_data: typeof hasil.total_data === "number" ? hasil.total_data : 0,
  };
}
