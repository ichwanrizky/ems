"use server";

import { apiDelete, apiGet, apiList, apiPatch, apiPost, apiPut } from "@/libs/ApiClient";

/** Config > User Luar — memanggil `ems-backend`, tanda tangan tidak berubah. */

type UserLuarProps = {
  number: number;
  id: number;
  username: string;
  name: string;
  telp: string;
  roles: {
    id: number;
    role_name: string;
  };
};

export const getUserLuar = async (
  search?: string,
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: UserLuarProps[] | [];
  total_data: number;
}> => {
  return await apiList<UserLuarProps>("/api/config/user-luar", {
    search,
    page: currentPage,
  });
};

export const getUserLuarId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    name: string;
    telp: string;
    roles: {
      id: number;
      role_name: string;
    };
  } | null;
}> => {
  const hasil = await apiGet<any>(`/api/config/user-luar/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createUserLuar = async (data: {
  name: string;
  telp: string;
  role_id: number | null;
  username: string;
  new_password: string;
  re_new_password: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/config/user-luar", data);

  return { status: hasil.status, message: hasil.message };
};

export const editUserLuar = async (data: {
  id: number;
  name: string;
  telp: string;
  role_id: number | null;
  username: string;
  new_password: string;
  re_new_password: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data;
  const hasil = await apiPut(`/api/config/user-luar/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteUserLuar = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/user-luar/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const resetPasswordUserLuar = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/config/user-luar/${id}/reset-password`);

  return { status: hasil.status, message: hasil.message };
};
