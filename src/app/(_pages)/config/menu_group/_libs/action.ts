"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { MenuGroupProps } from "@/types";

/**
 * Config > Menu Group — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * `parent_id` tidak lagi disusun di sini: backend yang menurunkannya dari nama
 * grup, supaya aturannya cuma ada di satu tempat.
 */

export const getMenuGroup = async (
  search?: string
): Promise<{
  status: boolean;
  message: string;
  data: MenuGroupProps[] | [];
}> => {
  const hasil = await apiList<MenuGroupProps>("/api/config/menu-group", { search });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getMenuGroupId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: MenuGroupProps | null;
}> => {
  const hasil = await apiGet<MenuGroupProps>(`/api/config/menu-group/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createMenuGroup = async (
  data: MenuGroupProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/menu-group", {
    menu_group: data.menu_group,
    urut: data.urut,
    group: data.group,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editMenuGroup = async (
  data: MenuGroupProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/config/menu-group/${data.id}`, {
    menu_group: data.menu_group,
    urut: data.urut,
    group: data.group,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteMenuGroup = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/menu-group/${id}`);

  return { status: hasil.status, message: hasil.message };
};
