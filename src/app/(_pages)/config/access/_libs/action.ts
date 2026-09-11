"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { RolesProps } from "@/types";

/** Config > Access — memanggil `ems-backend`, tanda tangan tidak berubah. */

export type MenuAccessProps = {
  id: number;
  menu_group: string;
  menu: {
    id: number;
    menu: string;
  }[];
};

export type CreateAccessProps = {
  role_id: number;
  department_id: { value: number; label: string }[];
  sub_department_id: { value: number; label: string }[];
  access: {
    menu_id: number;
    view: boolean;
    insert?: boolean;
    update?: boolean;
    delete?: boolean;
  }[];
};

export const getRolesAccess = async (
  role_id?: number
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps[] | [];
}> => {
  const hasil = await apiGet<RolesProps[]>("/api/config/access/roles", { role_id });

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getMenuAccess = async (): Promise<{
  status: boolean;
  message: string;
  data: MenuAccessProps[] | [];
}> => {
  const hasil = await apiGet<MenuAccessProps[]>("/api/config/access/menu");

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getAccess = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: RolesProps[] | [];
}> => {
  const hasil = await apiList<RolesProps>("/api/config/access", { search });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getAccessByRoles = async (
  role_id: number
): Promise<{
  status: boolean;
  message: string;
  data: CreateAccessProps | null;
}> => {
  const hasil = await apiGet<CreateAccessProps>(`/api/config/access/${role_id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createAccess = async (
  data: CreateAccessProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/access", data);

  return { status: hasil.status, message: hasil.message };
};

export const editAccess = async (
  data: CreateAccessProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const { role_id, ...body } = data;
  const hasil = await apiPut(`/api/config/access/${role_id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteAccess = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  // `id` di sini adalah role_id — akses memang disimpan per role, bukan per baris.
  const hasil = await apiDelete(`/api/config/access/${id}`);

  return { status: hasil.status, message: hasil.message };
};
