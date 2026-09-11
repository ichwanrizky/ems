"use server";

import { apiDelete, apiList } from "@/libs/ApiClient";
import { RiwayatOvertimeProps } from "@/types";

/** HR > OT Riwayat — memanggil `ems-backend`, tanda tangan tidak berubah. */

export const getRiwayatOt = async (
  search?: string,
  filter?: {
    department: string | number;
    sub_department?: string | number;
    tahun: string | number;
    bulan: string | number;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: RiwayatOvertimeProps[] | [];
  total_data: number;
}> => {
  return (await apiList<RiwayatOvertimeProps>("/api/hr/ot-riwayat", {
    search,
    department: filter?.department,
    sub_department: filter?.sub_department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
    page: currentPage,
  })) as any;
};

export const deleteRiwayatOt = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/ot-riwayat/${id}`);

  return { status: hasil.status, message: hasil.message };
};
