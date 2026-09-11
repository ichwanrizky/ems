"use server";

import { apiList, tanggalLokal } from "@/libs/ApiClient";
import { AbsenProps } from "@/types";

/**
 * HR > Absensi harian — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Pembatasan sub department tidak lagi disusun di sini; backend membacanya dari
 * token dan tetap menyertakan pegawai ber-`sub_department_id` NULL.
 */

export const getAbsensi = async (
  search: string,
  filter: {
    department: string | number;
    sub_department: string | number;
    status_absen: string | number;
    date: Date;
  }
): Promise<{
  status: boolean;
  message: string;
  data: AbsenProps[] | [];
}> => {
  const hasil = await apiList<AbsenProps>("/api/hr/absensi", {
    search,
    department: filter?.department,
    sub_department: filter?.sub_department,
    status_absen: filter?.status_absen,
    date: await tanggalLokal(filter?.date),
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};
