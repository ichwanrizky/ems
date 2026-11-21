/**
 * Kirim pesan WhatsApp lewat gowa (go-whatsapp-web-multidevice) yang jalan
 * di server yang sama.
 *
 * Env:
 *   WA_API_URL    base URL gowa, mis. http://localhost:3002
 *   WA_API_AUTH   basic auth gowa "user:password"
 *   WA_DEVICE_ID  id device yang sudah di-pair (opsional kalau cuma satu)
 *
 * Tidak pernah throw: kegagalan kirim WA tidak boleh menggagalkan proses
 * utama (mis. simpan pengajuan OT), jadi hasilnya cukup dicek/log.
 */
export const sendWhatsApp = async (
  phone: string,
  message: string
): Promise<{ status: boolean; message: string }> => {
  const baseUrl = process.env.WA_API_URL;
  const auth = process.env.WA_API_AUTH;

  if (!baseUrl || !auth) {
    return { status: false, message: "WA_API_URL / WA_API_AUTH belum diset" };
  }

  // Terima 08xx / +62xx / 62xx, kirim sebagai JID 62xx@s.whatsapp.net
  let number = phone.replace(/\D/g, "");
  if (number.startsWith("0")) number = "62" + number.slice(1);
  if (!number) {
    return { status: false, message: "Nomor WA kosong" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: "Basic " + Buffer.from(auth).toString("base64"),
  };
  if (process.env.WA_DEVICE_ID) {
    headers["X-Device-Id"] = process.env.WA_DEVICE_ID;
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/send/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone: `${number}@s.whatsapp.net`,
        message,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || body?.code !== "SUCCESS") {
      return {
        status: false,
        message: `Gagal kirim WA (${res.status}): ${body?.message ?? "-"}`,
      };
    }

    return { status: true, message: "WA terkirim" };
  } catch (error: any) {
    return { status: false, message: `Gagal kirim WA: ${error?.message}` };
  }
};
