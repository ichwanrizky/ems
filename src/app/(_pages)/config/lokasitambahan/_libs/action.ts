"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { PegawaiLocationCreateProps, PegawaiLocationProps } from "@/types";

/** Config > Lokasi Tambahan — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getPegawaiLokasi = async (
  department_id?: number,
  pegawai_id?: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiLocationProps[];
  total_data: number;
}> => {
  return await apiList<PegawaiLocationProps>("/api/config/lokasi-tambahan", {
    department_id,
    pegawai_id,
  });
};

export const getPegawaiLokasiId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiLocationProps | null;
}> => {
  const hasil = await apiGet<PegawaiLocationProps>(
    `/api/config/lokasi-tambahan/${id}`
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createPegawaiLokasi = async (
  data: PegawaiLocationCreateProps
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiPost("/api/config/lokasi-tambahan", {
    nama_lokasi: data.nama_lokasi,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
    pegawai_id: data.pegawai_id,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editPegawaiLokasi = async (
  data: PegawaiLocationCreateProps
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiPut(`/api/config/lokasi-tambahan/${data.id}`, {
    nama_lokasi: data.nama_lokasi,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
    pegawai_id: data.pegawai_id,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deletePegawaiLokasi = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/config/lokasi-tambahan/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const getPegawaiByDepartment = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data: { id: number; nama: string }[];
}> => {
  const hasil = await apiGet<{ id: number; nama: string }[]>(
    "/api/config/lokasi-tambahan/pegawai",
    { department_id }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};
