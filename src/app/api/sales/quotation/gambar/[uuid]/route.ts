import { getAccessToken } from "@/libs/ApiClient";
import { NextResponse } from "next/server";

/**
 * Penerus gambar lampiran item quotation dari `ems-backend`.
 *
 * Alasannya sama dengan route PDF di sebelah: `ApiClient` hanya mengerti JSON,
 * dan token backend sengaja tidak pernah sampai ke browser — jadi `<img>` tidak
 * bisa menembak backend langsung. Route ini yang melakukannya di server lalu
 * meneruskan bytenya apa adanya.
 *
 * Berkasnya ada di luar document root backend, jadi ini satu-satunya jalan
 * melihatnya.
 */

const BASE_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(uuid)) {
    return NextResponse.json(
      { status: false, message: "Id gambar tidak sah" },
      { status: 400 }
    );
  }

  if (!BASE_URL) {
    console.error("BACKEND_URL belum diset — gambar quotation tidak bisa diambil.");

    return NextResponse.json(
      { status: false, message: "Konfigurasi server belum lengkap" },
      { status: 500 }
    );
  }

  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { status: false, message: "Sesi berakhir, silakan login ulang" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/sales/quotation/gambar/${uuid}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: false, message: "Gambar tidak ditemukan" },
        { status: response.status }
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        // Berkasnya tidak pernah berubah untuk satu uuid — uuid baru dibuat
        // setiap unggahan — jadi aman di-cache lama di browser.
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    console.error(`Gagal mengambil gambar quotation ${uuid}:`, error);

    return NextResponse.json(
      { status: false, message: "Tidak dapat terhubung ke server" },
      { status: 502 }
    );
  }
}
