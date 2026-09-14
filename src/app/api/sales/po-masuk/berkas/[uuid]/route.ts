import { getAccessToken } from "@/libs/ApiClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * Penerus berkas arsip PO masuk dari `ems-backend`.
 *
 * Alasannya sama dengan route PDF/gambar quotation: `ApiClient` hanya mengerti
 * JSON, dan token backend sengaja tidak pernah sampai ke browser — jadi tautan
 * `<a>` tidak bisa menembak backend langsung. Route ini yang melakukannya di
 * server lalu meneruskan bytenya apa adanya.
 *
 * Berkasnya ada di luar document root backend, jadi ini satu-satunya jalan
 * membukanya.
 *
 * ## Content-Type diteruskan, tidak dipatok
 *
 * Berbeda dari route gambar quotation yang selalu `image/jpeg` — di sana semua
 * unggahan di-encode ulang jadi JPEG. Di sini berkasnya disimpan apa adanya dan
 * bisa PDF, PNG, atau XLSX, jadi header dari backend yang dipakai. Memaksakan
 * satu tipe akan membuat browser mengunduh PDF sebagai berkas rusak.
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(uuid)) {
    return NextResponse.json(
      { status: false, message: "Id berkas tidak sah" },
      { status: 400 },
    );
  }

  if (!BASE_URL) {
    console.error("BACKEND_URL belum diset — berkas PO tidak bisa diambil.");

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
      `${BASE_URL}/api/sales/po-masuk/berkas/${uuid}${unduh}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: "Berkas tidak ditemukan" },
        { status: response.status },
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/octet-stream",
        // Nama asli berkas dari customer ikut diteruskan — itu yang dicari
        // orang di folder unduhannya, bukan uuid.
        "Content-Disposition":
          response.headers.get("Content-Disposition") ?? "inline",
        // Berkasnya tidak pernah berubah untuk satu uuid — uuid baru dibuat
        // setiap unggahan — jadi aman di-cache lama di browser.
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil berkas PO ${uuid}:`, error);

    return NextResponse.json(
      { status: false, message: "Tidak dapat terhubung ke server" },
      { status: 502 },
    );
  }
}
