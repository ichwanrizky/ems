"use server";

import { apiList, apiPut } from "@/libs/ApiClient";
import { PegawaiShiftProps } from "@/types";

/** HR > Shift Active — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getPegawaiShift = async (
  department_id?: number | string
): Promise<{
  status: boolean;
  message: string;
  data: PegawaiShiftProps[] | [];
}> => {
  const hasil = await apiList<PegawaiShiftProps>("/api/hr/shift-active", {
    department_id,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const SavePegawaiShift = async (
  data: PegawaiShiftProps[]
): Promise<{
  status: boolean;
  message: string;
}> => {
  // Backend menyimpan seluruh daftar dalam satu transaksi: satu pegawai gagal
  // berarti tidak ada yang tersimpan.
  const hasil = await apiPut("/api/hr/shift-active", { data });

  return { status: hasil.status, message: hasil.message };
};
