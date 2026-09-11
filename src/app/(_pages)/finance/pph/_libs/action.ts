"use server";

import { apiList } from "@/libs/ApiClient";

/**
 * Finance > PPH — memanggil `ems-backend`, tanda tangan tidak berubah.
 * Read-only: baris `pph21` lahir saat gaji digenerate dan ikut terhapus saat
 * gajinya dihapus.
 */

type PphProps = {
  id: number;
  gaji: number;
  pph21: number;
  thr: number | null;
  pegawai_id: number;
  nama: string;
  npwp: string | null;
};

export const getPph = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PphProps[];
}> => {
  const hasil = await apiList<PphProps>("/api/finance/pph", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};
