"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { ShiftMasterProps } from "@/types";

/** HR > Shift Master — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getShiftMaster = async (
  search?: string,
  department_id?: number | string
): Promise<{
  status: boolean;
  message: string;
  data: ShiftMasterProps[] | [];
}> => {
  const hasil = await apiList<ShiftMasterProps>("/api/hr/shift-master", {
    search,
    department_id,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const getShiftMasterId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: ShiftMasterProps | null;
}> => {
  const hasil = await apiGet<ShiftMasterProps>(`/api/hr/shift-master/${id}`);

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? null };
};

export const createShiftMaster = async (
  data: ShiftMasterProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/hr/shift-master", {
    department_id: data.department_id,
    jam_masuk: data.jam_masuk,
    jam_pulang: data.jam_pulang,
    keterangan: data.keterangan,
    cond_friday: data.cond_friday,
  });

  return { status: hasil.status, message: hasil.message };
};

export const editShiftMaster = async (
  data: ShiftMasterProps
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut(`/api/hr/shift-master/${data.id}`, {
    department_id: data.department_id,
    jam_masuk: data.jam_masuk,
    jam_pulang: data.jam_pulang,
    keterangan: data.keterangan,
    cond_friday: data.cond_friday,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteShiftMaster = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/shift-master/${id}`);

  return { status: hasil.status, message: hasil.message };
};
