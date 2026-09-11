"use server";

import { apiDelete, apiGet, apiList, apiPatch, apiPut } from "@/libs/ApiClient";

/** Config > User — memanggil `ems-backend`, tanda tangan tidak berubah. */

type UserListProps = {
  number: number;
  id: number;
  username: string;
  pegawai: {
    id: number;
    nama: string;
    telp: string;
  };
};

export const getUser = async (
  search?: string,
  filter?: {
    department: string | number;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: UserListProps[] | [];
  total_data: number;
}> => {
  const hasil = await apiList<UserListProps>("/api/config/user", {
    search,
    department: filter?.department,
    page: currentPage,
  });

  return hasil;
};

export const getUserId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    pegawai: {
      id: number;
      nama: string;
      telp: string;
    };
    roles: {
      id: number;
      role_name: string;
    };
  } | null;
}> => {
  const hasil = await apiGet<any>(`/api/config/user/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const editUser = async (data: {
  id: number;
  role_id: number | null;
  username: string;
  new_password?: string;
  re_new_password?: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const { id, ...body } = data;
  const hasil = await apiPut(`/api/config/user/${id}`, body);

  return { status: hasil.status, message: hasil.message };
};

export const deleteUser = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/config/user/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const resetPassword = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/config/user/${id}/reset-password`);

  return { status: hasil.status, message: hasil.message };
};
