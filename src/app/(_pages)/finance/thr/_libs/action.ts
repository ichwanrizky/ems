"use server";

import { apiDelete, apiList } from "@/libs/ApiClient";
import { ThrProps } from "@/types";

/**
 * Finance > THR — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Seperti sebelumnya, THR tidak dibuat dari aplikasi: barisnya diisi dari luar,
 * lalu dibaca di sini dan ikut diperhitungkan sebagai dasar PPH21 saat gaji
 * bulan yang sama digenerate.
 */

export const getThr = async (
  search: string,
  filter: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ThrProps[] | [];
}> => {
  const hasil = await apiList<ThrProps>("/api/finance/thr", {
    search,
    department: filter.department,
    bulan: filter.bulan,
    tahun: filter.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const deleteThr = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/finance/thr/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const exportExcelThr = async (
  search: string,
  filter: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ThrProps[] | [];
}> => {
  return getThr(search, filter);
};
