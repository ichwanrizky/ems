"use server";

import { apiFetch } from "@/libs/ApiClient";
import { SlipGajiDataProps } from "@/types";

/**
 * Slip gaji publik — memanggil `ems-backend` TANPA token: halaman ini dibuka
 * dari tautan di aplikasi mobile, kuncinya uuid acak di URL.
 */

export const getSlipGaji = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: SlipGajiDataProps | null;
}> => {
  const hasil = await apiFetch<SlipGajiDataProps>(
    `/api/publik/slip-gaji/${encodeURIComponent(uuid)}`,
    { tanpaToken: true }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};
