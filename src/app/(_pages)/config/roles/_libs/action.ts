"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { RolesProps } from "@/types";

/** Config > Roles — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getRoles = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps[] | [];
}> => {
  const hasil = await apiList<RolesProps>("/api/config/roles", { search });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getRolesId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps | null;
}> => {
  const hasil = await apiGet<RolesProps>(`/api/config/roles/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createRoles = async (
  data: RolesProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/roles", { role_name: data.role_name });

  return { status: hasil.status, message: hasil.message };
};

export const editRoles = async (
  data: RolesProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/config/roles/${data.id}`, {
    role_name: data.role_name,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteRoles = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/roles/${id}`);

  return { status: hasil.status, message: hasil.message };
};
