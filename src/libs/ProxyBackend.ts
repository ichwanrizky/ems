import "server-only";

import { NextResponse } from "next/server";

/**
 * Penerus request aplikasi mobile ke `ems-backend`.
 *
 * Aplikasi mobile yang sudah beredar memanggil `/api/mobile/*` di aplikasi ini.
 * Daripada memaksa rilis ulang aplikasinya, route-route itu dipertahankan tapi
 * isinya cuma meneruskan request ke backend — URL, header, dan bentuk
 * responsnya tidak berubah sama sekali dari sisi aplikasi.
 *
 * Yang diteruskan:
 * - header `Authorization` apa adanya (backend yang memvalidasi token dan
 *   memeriksa baris `session_mobile`);
 * - body `FormData` diubah jadi JSON, karena backend menerima keduanya tapi
 *   JSON lebih murah diproses;
 * - query string apa adanya.
 *
 * Status code dari backend ikut diteruskan supaya penanganan error di aplikasi
 * mobile tetap bekerja seperti semula.
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export async function proxyKeBackend(
  req: Request,
  path: string,
  method: "GET" | "POST" = "GET"
): Promise<NextResponse> {
  if (!BASE_URL) {
    console.error("BACKEND_URL belum diset — proxy mobile tidak bisa jalan.");

    return NextResponse.json(
      { status: false, message: "Konfigurasi server belum lengkap" },
      { status: 500 }
    );
  }

  const asal = new URL(req.url);
  const tujuan = `${BASE_URL}${path}${asal.search}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const authorization = req.headers.get("Authorization");

  if (authorization) {
    headers.Authorization = authorization;
  }

  let body: string | undefined;

  if (method === "POST") {
    const isi: Record<string, string> = {};

    try {
      const form = await req.formData();
      form.forEach((value, key) => {
        if (typeof value === "string") isi[key] = value;
      });
    } catch {
      // Bukan FormData — coba baca sebagai JSON.
      try {
        const json = await req.json();
        if (json && typeof json === "object") Object.assign(isi, json);
      } catch {
        // Body kosong; biarkan.
      }
    }

    headers["Content-Type"] = "application/json";
    body = JSON.stringify(isi);
  }

  try {
    const response = await fetch(tujuan, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const teks = await response.text();

    try {
      return NextResponse.json(JSON.parse(teks), { status: response.status });
    } catch {
      console.error(`Respons non-JSON dari ${path} (${response.status})`);

      return NextResponse.json(
        { status: false, message: "Server sedang bermasalah, coba lagi nanti" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error(`Gagal meneruskan ${path} ke backend:`, error);

    return NextResponse.json(
      { status: false, message: "Tidak dapat terhubung ke server" },
      { status: 502 }
    );
  }
}
