"use server";

import { apiFetch } from "@/libs/ApiClient";

/**
 * Slip THR publik — memanggil `ems-backend` TANPA token; kuncinya uuid acak di
 * URL, sama seperti slip gaji.
 */

export type SlipThrDataProps = {
  id: number;
  uuid: string;
  bulan: number;
  tahun: number;
  thr: number;
  pph21: number;
  net_thr: number;
  pegawai: {
    nama: string;
    position: string;
  };
  department: {
    nama_department: string;
  };
};

export const getSlipThr = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: SlipThrDataProps | null;
}> => {
  const hasil = await apiFetch<SlipThrDataProps>(
    `/api/publik/slip-thr/${encodeURIComponent(uuid)}`,
    { tanpaToken: true }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};
