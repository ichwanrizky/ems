"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";

/** Config > Tanggal Merah — memanggil `ems-backend`, tanda tangan tidak berubah. */

type TanggalMerahProps = {
  id: number;
  bulan: number;
  tahun: number;
  tanggal_merah_list: {
    tanggal_nomor: string;
  }[];
  department: {
    id: number;
    nama_department: string;
  };
};

export const getTanggalMerah = async (filter: {
  department: string | number;
  tahun: string | number;
}): Promise<{
  status: boolean;
  message: string;
  data: TanggalMerahProps[];
}> => {
  const hasil = await apiList<TanggalMerahProps>("/api/config/tanggal-merah", {
    department: filter.department,
    tahun: filter.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getTanggalMerahId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: TanggalMerahProps | null;
}> => {
  const hasil = await apiGet<TanggalMerahProps>(`/api/config/tanggal-merah/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createTanggalMerah = async (data: {
  department: string | number;
  bulan: string | number;
  tahun: string | number;
  tanggal: {
    value: string;
    label: string;
  }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  // Kolom `tanggal` penuh tidak lagi disusun di sini — backend menurunkannya
  // dari bulan/tahun + nomor tanggal, sekaligus membuang tanggal yang tidak ada
  // di bulan itu (mis. 31 April).
  const hasil = await apiPost("/api/config/tanggal-merah", data);

  return { status: hasil.status, message: hasil.message };
};

export const editTanggalMerah = async (data: {
  id: number;
  department: string | number;
  bulan: string | number;
  tahun: string | number;
  tanggal: {
    value: string;
    label: string;
  }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data;
  const hasil = await apiPut(`/api/config/tanggal-merah/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteTanggalMerah = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/tanggal-merah/${id}`);

  return { status: hasil.status, message: hasil.message };
};
