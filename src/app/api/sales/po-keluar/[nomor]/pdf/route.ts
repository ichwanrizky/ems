import { getAccessToken } from "@/libs/ApiClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * Penerus PDF PO keluar dari `ems-backend`.
 *
 * `ApiClient` hanya mengerti JSON, dan token backend sengaja tidak pernah sampai
 * ke browser — jadi halaman tidak bisa memanggil endpoint PDF-nya langsung.
 * Route ini yang melakukannya di server: ambil token dari session, tembak
 * backend, lalu teruskan bytenya apa adanya. Di komponen cukup
 * `window.open("/api/sales/po-keluar/PJ-PO-SMS-26-0001/pdf")`.
 *
 * Berbeda dengan `/api/mobile/*` yang memakai `ProxyBackend`, di sini responsnya
 * biner — `ProxyBackend` selalu mem-parse JSON, jadi tidak bisa dipakai.
 *
 * ## Segmennya NOMOR, bukan id
 *
 * Tautan ini terlihat orang: muncul di address bar tab baru, disalin ke chat,
 * dan jadi nama berkas saat diunduh. `…/po-keluar/1/pdf` tidak memberi tahu apa
 * pun tentang isinya.
 *
 * Nomor PO keluar selalu berpola baru (`PJ-PO-SMS-26-0001`) dan sudah ber-strip,
 * jadi tidak ada garis miring yang perlu diterjemahkan. Polanya tetap disamakan
 * dengan route PDF quotation supaya keduanya berperilaku sama kalau suatu saat
 * PO lama ikut diimpor.
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
      { status: false, message: "Nomor PO tidak sah" },
      { status: 400 },
    );
  }

  if (!BASE_URL) {
    console.error("BACKEND_URL belum diset — PDF PO tidak bisa diambil.");

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
      `${BASE_URL}/api/sales/po-keluar/${nomor}/pdf${unduh}`,
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
          { status: false, message: "Gagal membuat PDF PO" },
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
          `inline; filename="PO-${nomor}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil PDF PO ${nomor}:`, error);

    return NextResponse.json(
      { status: false, message: "Tidak dapat terhubung ke server" },
      { status: 502 },
    );
  }
}
