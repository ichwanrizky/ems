"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { MenuProps } from "@/types";

/**
 * Config > Menu — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * `path` dan `last_path` sekarang disusun backend dari nama menu + `parent_id`
 * menu groupnya. Versi lama menyusunnya di sini dan pada fungsi edit memakai
 * prefiks "config/" untuk SEMUA grup, sehingga menu HR/Finance yang pernah
 * diedit berpindah path dan halamannya berbalas "Access Denied".
 */

export const getMenu = async (
  search?: string,
  filter?: {
    menu_group?: string;
  }
): Promise<{
  status: boolean;
  message: string;
  data: MenuProps[] | [];
}> => {
  const hasil = await apiList<MenuProps>("/api/config/menu", {
    search,
    menu_group: filter?.menu_group,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getMenuId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: MenuProps | null;
}> => {
  const hasil = await apiGet<MenuProps>(`/api/config/menu/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createMenu = async (
  data: MenuProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/menu", {
    menu: data.menu,
    urut: data.urut,
    menu_group_id: data.menu_group_id,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editMenu = async (
  data: MenuProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/config/menu/${data.id}`, {
    menu: data.menu,
    urut: data.urut,
    menu_group_id: data.menu_group_id,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteMenu = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/menu/${id}`);

  return { status: hasil.status, message: hasil.message };
};
