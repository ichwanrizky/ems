"use server";

import { apiDelete, apiList, apiPatch } from "@/libs/ApiClient";
import { PengajuanIzinProps } from "@/types";

/**
 * HR > Izin Pengajuan — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Field `approval` per baris tetap dikirim backend untuk mengatur tombolnya.
 * Bedanya sekarang backend juga MENOLAK approval dari user yang bukan
 * manager/supervisor sub department pegawai itu — sebelumnya tombolnya hanya
 * disembunyikan, tapi endpointnya tetap bisa dipanggil langsung.
 */

export const getPengajuanIzin = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PengajuanIzinProps[] | [];
}> => {
  const hasil = await apiList<PengajuanIzinProps>("/api/hr/izin-pengajuan", {
    search,
    department: filter?.department,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const deletePengajuanIzin = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/izin-pengajuan/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const approvalPengajuanIzin = async (
  id: number,
  status: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/hr/izin-pengajuan/${id}/approval`, { status });

  return { status: hasil.status, message: hasil.message };
};
