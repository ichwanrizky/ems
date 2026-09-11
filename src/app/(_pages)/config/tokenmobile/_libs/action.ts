"use server";

import { apiList, apiPatch } from "@/libs/ApiClient";

/** Config > Token Mobile — memanggil `ems-backend`, tanda tangan tidak berubah. */

type TokenMobileProps = {
  number: number;
  id: number;
  token: string;
  user: {
    pegawai: {
      id: number;
      nama: string;
    };
  };
};

export const getTokenMobile = async (
  search?: string,
  filter?: {
    department: string | number;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: TokenMobileProps[] | [];
  total_data: number;
}> => {
  return await apiList<TokenMobileProps>("/api/config/token-mobile", {
    search,
    department: filter?.department,
    page: currentPage,
  });
};

export const resetToken = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/config/token-mobile/${id}/reset`);

  return { status: hasil.status, message: hasil.message };
};
