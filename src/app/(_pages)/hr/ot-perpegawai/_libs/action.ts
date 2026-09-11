"use server";

import { apiDelete, apiGet, apiList } from "@/libs/ApiClient";
import { OvertimeMonthlyProps } from "@/types";

/** HR > OT per Pegawai — memanggil `ems-backend`, tanda tangan tidak berubah. */

type PegawaiAbsen = {
  id: number;
  nama: string;
};

export const getOvertimePegawai = async (filter: {
  bulan: number;
  tahun: number;
  pegawai: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: OvertimeMonthlyProps[] | [];
}> => {
  const hasil = await apiList<OvertimeMonthlyProps>("/api/hr/ot-per-pegawai", {
    bulan: filter.bulan,
    tahun: filter.tahun,
    pegawai: filter.pegawai,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const deleteOvertimePegawai = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  // Backend membuang baris `overtime` sekaligus keikutsertaan pegawai itu di
  // pengajuannya, jadi pengajuan tetap berlaku untuk pegawai lain.
  const hasil = await apiDelete(`/api/hr/ot-per-pegawai/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const getPegawaiOvertime = async (
  department: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiAbsen[] | [];
}> => {
  const hasil = await apiGet<PegawaiAbsen[]>("/api/hr/ot-per-pegawai/pegawai", {
    department,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};
