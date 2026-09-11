"use server";

import { apiDelete, apiGet, apiList, apiPatch, apiPost, apiPut } from "@/libs/ApiClient";
import { PegawaiCreateProps, PegawaiProps } from "@/types";

/**
 * HR > Data Karyawan — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Pembuatan user pegawai dan pencatatan riwayat JOIN sekarang terjadi di
 * backend dalam satu transaksi bersama baris pegawainya.
 */

export const getPegawai = async (
  search?: string,
  filter?: {
    department: string | number;
    sub_department?: string | number;
    active: boolean;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiProps[] | [];
  total_data: number;
}> => {
  return (await apiList<PegawaiProps>("/api/hr/data-karyawan", {
    search,
    department: filter?.department,
    sub_department: filter?.sub_department,
    active: filter?.active,
    page: currentPage,
  })) as any;
};

export const getPegawaiId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiProps | null;
}> => {
  const hasil = await apiGet<PegawaiProps>(`/api/hr/data-karyawan/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createDataKaryawan = async (
  data: PegawaiCreateProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/hr/data-karyawan", data as any);

  return { status: hasil.status, message: hasil.message };
};

export const editDataKaryawan = async (
  data: PegawaiCreateProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data as any;
  const hasil = await apiPut(`/api/hr/data-karyawan/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteDataKaryawan = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/data-karyawan/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const setActiveDataKaryawan = async (
  id: number,
  is_active: boolean
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/hr/data-karyawan/${id}/status`, { is_active });

  return { status: hasil.status, message: hasil.message };
};

export const createUserPegawai = async (
  pegawaiId: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost(`/api/hr/data-karyawan/${pegawaiId}/user`);

  return { status: hasil.status, message: hasil.message };
};
