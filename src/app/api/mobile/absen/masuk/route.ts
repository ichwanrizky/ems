import { proxyKeBackend } from "@/libs/ProxyBackend";

/** Diteruskan ke ems-backend; lihat `libs/ProxyBackend`. */
export async function POST(req: Request) {
  return proxyKeBackend(req, "/api/mobile/absen/masuk", "POST");
}
