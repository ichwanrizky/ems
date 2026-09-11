"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { AdjustmentProps } from "@/types";

/** Finance > Adjustment Gaji — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getPegawaiAdjustment = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        id: number;
        nama: string;
      }[];
}> => {
  const hasil = await apiGet<{ id: number; nama: string }[]>(
    "/api/finance/adjustment/pegawai",
    { department_id }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const createAdjustment = async (data: {
  department_id: number | string;
  pegawai_id: number | string;
  bulan: number | string;
  tahun: number | string;
  jenis: string;
  nominal: number | string;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/finance/adjustment", data);

  return { status: hasil.status, message: hasil.message };
};

export const getAdjustment = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: AdjustmentProps[] | [];
}> => {
  const hasil = await apiList<AdjustmentProps>("/api/finance/adjustment", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getAdjustmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: AdjustmentProps | null;
}> => {
  const hasil = await apiGet<AdjustmentProps>(`/api/finance/adjustment/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const editAdjustment = async (data: {
  id: number | null;
  department_id: number | string;
  pegawai_id: number | string;
  bulan: number | string;
  tahun: number | string;
  jenis: string;
  nominal: number | string;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data;
  const hasil = await apiPut(`/api/finance/adjustment/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteAdjustment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/finance/adjustment/${id}`);

  return { status: hasil.status, message: hasil.message };
};
