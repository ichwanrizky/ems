import { getAccessToken } from "@/libs/ApiClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * Penerus PDF quotation dari `ems-backend`.
 *
 * `ApiClient` hanya mengerti JSON, dan token backend sengaja tidak pernah sampai
 * ke browser — jadi halaman tidak bisa memanggil endpoint PDF-nya langsung.
 * Route ini yang melakukannya di server: ambil token dari session, tembak
 * backend, lalu teruskan bytenya apa adanya. Di komponen cukup
 * `window.open("/api/sales/quotation/001-QUO-PJ-IX-2026/pdf")`.
 *
 * Berbeda dengan `/api/mobile/*` yang memakai `ProxyBackend`, di sini responsnya
 * biner — `ProxyBackend` selalu mem-parse JSON, jadi tidak bisa dipakai.
 *
 * ## Segmennya NOMOR, bukan id
 *
 * Tautan ini terlihat orang: muncul di address bar tab baru, disalin ke chat,
 * dan jadi nama berkas saat diunduh. `…/quotation/1/pdf` tidak memberi tahu apa
 * pun tentang isinya.
 *
 * Garis miring di nomor (`001/QUO/PJ/IX/2026`) ditulis sebagai strip karena ia
 * pemisah segmen URL — dan sengaja BUKAN di-`encodeURIComponent`: `%2F` di
 * dalam path ditolak sebagian proxy dan dinormalkan sebagian yang lain, jadi
 * tautannya hidup-mati tergantung apa yang berdiri di depan aplikasi ini.
 * Backend yang mencocokkan ke arah sebaliknya (`REPLACE(nomor, '/', '-')`).
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

/** Nomor ber-strip: huruf, angka, dan strip. Backend memvalidasi ulang. */
const POLA_NOMOR = /^[A-Za-z0-9-]{5,60}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nomor: string }> },
) {
  const { nomor } = await params;

  if (!POLA_NOMOR.test(nomor)) {
    return NextResponse.json(
      { status: false, message: "Nomor quotation tidak sah" },
      { status: 400 },
    );
  }

  if (!BASE_URL) {
    console.error(
      "BACKEND_URL belum diset — PDF quotation tidak bisa diambil.",
    );

    return NextResponse.json(
      { status: false, message: "Konfigurasi server belum lengkap" },
      { status: 500 },
    );
  }

  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { status: false, message: "Sesi berakhir, silakan login ulang" },
      { status: 401 },
    );
  }

  const unduh = req.nextUrl.searchParams.get("unduh") === "1" ? "?unduh=1" : "";

  try {
    const response = await fetch(
      `${BASE_URL}/api/sales/quotation/${nomor}/pdf${unduh}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    // Backend membalas JSON saat gagal (403/404) dan PDF saat berhasil.
    // Diteruskan apa adanya supaya pesan errornya tetap terbaca di tab baru.
    if (!response.ok) {
      const teks = await response.text();

      try {
        return NextResponse.json(JSON.parse(teks), { status: response.status });
      } catch {
        return NextResponse.json(
          { status: false, message: "Gagal membuat PDF quotation" },
          { status: 502 },
        );
      }
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          response.headers.get("Content-Disposition") ??
          `inline; filename="Quotation-${nomor}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil PDF quotation ${nomor}:`, error);

    return NextResponse.json(
      { status: false, message: "Tidak dapat terhubung ke server" },
      { status: 502 },
    );
  }
}
