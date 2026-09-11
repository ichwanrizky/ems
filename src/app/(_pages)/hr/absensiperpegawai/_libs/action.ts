"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut, tanggalLokal } from "@/libs/ApiClient";
import { AttendanceMonthlyProps } from "@/types";

/**
 * HR > Absensi per Pegawai — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Perhitungan menit keterlambatan untuk absen manual sekarang di backend
 * (selisih jam absen masuk terhadap jam masuk shift, tidak pernah negatif).
 */

type PegawaiAbsen = {
  id: number;
  nama: string;
};

export const getPegawaiAbsen = async (
  department: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiAbsen[] | [];
}> => {
  const hasil = await apiGet<PegawaiAbsen[]>(
    "/api/hr/absensi-per-pegawai/pegawai",
    { department }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getAbsensiPerpegawai = async (filter: {
  bulan: number;
  tahun: number;
  pegawai: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: AttendanceMonthlyProps[] | [];
}> => {
  const hasil = await apiList<AttendanceMonthlyProps>("/api/hr/absensi-per-pegawai", {
    bulan: filter.bulan,
    tahun: filter.tahun,
    pegawai: filter.pegawai,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const createAbsensiPerpegawai = async (data: {
  date: string | Date;
  pegawai_id: number;
  absen_masuk: string;
  absen_pulang: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/hr/absensi-per-pegawai", {
    date: await tanggalLokal(data.date),
    pegawai_id: data.pegawai_id,
    absen_masuk: data.absen_masuk,
    absen_pulang: data.absen_pulang,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editAbsensiPerpegawai = async (data: {
  date: string | Date;
  pegawai_id: number;
  absen_id: string | number;
  absen_masuk: string;
  absen_pulang: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/hr/absensi-per-pegawai/${data.absen_id}`, {
    date: await tanggalLokal(data.date),
    pegawai_id: data.pegawai_id,
    absen_masuk: data.absen_masuk,
    absen_pulang: data.absen_pulang,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteAbsensiPerpegawai = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/absensi-per-pegawai/${id}`);

  return { status: hasil.status, message: hasil.message };
};
