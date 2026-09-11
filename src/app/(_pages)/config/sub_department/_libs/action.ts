"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { AtasanProps, DepartmentProps, SubDepartmentProps } from "@/types";

/** Config > Sub Department — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getSubDepartmentMultipleDepartment = async (
  department_id: { value: number; label: string }[]
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  const hasil = await apiList<SubDepartmentProps>(
    "/api/config/sub-department/by-department",
    { department_id: department_id?.map((item) => item.value) ?? [] }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getAtasan = async (): Promise<{
  status: boolean;
  message: string;
  data: AtasanProps[] | [];
}> => {
  const hasil = await apiGet<AtasanProps[]>("/api/config/sub-department/atasan");

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getJenisIzin = async (
  department_id?: number | null
): Promise<{
  status: boolean;
  message: string;
  data: any[] | [];
}> => {
  if (!department_id) {
    return { status: true, message: "Data fetched successfully", data: [] };
  }

  const hasil = await apiGet<any[]>("/api/config/sub-department/jenis-izin", {
    department_id,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getSubDepartment = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps[] | [];
}> => {
  const hasil = await apiList<SubDepartmentProps>("/api/config/sub-department", {
    search,
    department: filter?.department,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getSubDepartmentId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: SubDepartmentProps | null;
}> => {
  const hasil = await apiGet<SubDepartmentProps>(`/api/config/sub-department/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createSubDepartment = async (data: {
  department: number;
  nama_sub_department: string;
  leader: number | null;
  supervisor: number | null;
  manager: number | null;
  akses_izin: { value: string; label: string }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/sub-department", data);

  return { status: hasil.status, message: hasil.message };
};

export const editSubDepartment = async (data: {
  id: number;
  department: number;
  nama_sub_department: string;
  leader: number | null;
  supervisor: number | null;
  manager: number | null;
  akses_izin: { value: string; label: string }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data;
  const hasil = await apiPut(`/api/config/sub-department/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteSubDepartment = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/sub-department/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const getDepartment = async (): Promise<{
  status: boolean;
  message: string;
  data: DepartmentProps[] | [];
}> => {
  const hasil = await apiGet<DepartmentProps[]>(
    "/api/config/sub-department/department"
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};
