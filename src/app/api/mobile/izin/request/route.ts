import { proxyKeBackend } from "@/libs/ProxyBackend";

/** Diteruskan ke ems-backend; lihat `libs/ProxyBackend`. */
export async function GET(req: Request) {
  return proxyKeBackend(req, "/api/mobile/izin/request");
}
