"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { DepartmentLocationProps, DepartmentProps } from "@/types";

/**
 * Config > Department.
 *
 * Sejak migrasi, berkas ini tidak lagi menyentuh Prisma — isinya pemanggilan
 * `ems-backend`. Tanda tangan tiap fungsi sengaja dipertahankan persis seperti
 * sebelumnya supaya komponen di `_components/` tidak perlu diubah.
 */

export const getDepartment = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentProps[] | [];
}> => {
  const hasil = await apiList<DepartmentProps>("/api/config/department", { search });

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data,
  };
};

export const getDepartmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentProps | null;
}> => {
  const hasil = await apiGet<DepartmentProps>(`/api/config/department/${id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

export const getJenisIzin = async (): Promise<{
  status: boolean;
  message: string;
  data: { kode: string; jenis: string }[] | [];
}> => {
  const hasil = await apiGet<{ kode: string; jenis: string }[]>(
    "/api/config/department/jenis-izin"
  );

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? [],
  };
};

export const createDepartment = async (
  data: DepartmentProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/department", {
    nama_department: data.nama_department,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editDepartment = async (
  data: DepartmentProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/config/department/${data.id}`, {
    nama_department: data.nama_department,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
    // Backend menerima array kode maupun array objek react-select apa adanya.
    akses_izin_department: data.akses_izin_department ?? [],
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteDepartment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/department/${id}`);

  return { status: hasil.status, message: hasil.message };
};

// ── Department Location CRUD ──────────────────────────────────────────────────

export const getDepartmentLocation = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentLocationProps[];
}> => {
  const hasil = await apiList<DepartmentLocationProps>(
    `/api/config/department/${department_id}/lokasi`
  );

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data,
  };
};

export const getDepartmentLocationId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: DepartmentLocationProps | null;
}> => {
  const hasil = await apiGet<DepartmentLocationProps>(
    `/api/config/department/lokasi/${id}`
  );

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

export const createDepartmentLocation = async (
  data: DepartmentLocationProps
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiPost(`/api/config/department/${data.department_id}/lokasi`, {
    nama_lokasi: data.nama_lokasi,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editDepartmentLocation = async (
  data: DepartmentLocationProps
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiPut(`/api/config/department/lokasi/${data.id}`, {
    nama_lokasi: data.nama_lokasi,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteDepartmentLocation = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/config/department/lokasi/${id}`);

  return { status: hasil.status, message: hasil.message };
};
