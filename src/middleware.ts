import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middlewares/WithAuth";

// This function can be marked `async` if using `await` inside
export function mainMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  return res;
}

// Setiap modul baru di `(_pages)` HARUS ditambahkan di sini. Halaman yang tidak
// terdaftar tetap terlindungi layout `(_pages)` (yang menendang sesi kosong ke
// /auth/logout), tapi lewat middleware pengalihannya jadi ke halaman login
// beserta `callbackUrl` — user kembali ke halaman yang dituju setelah login,
// bukan terlempar keluar.
export default withAuth(mainMiddleware, [
  "/hr/",
  "/finance/",
  "/sales/",
  "/config/",
]);
