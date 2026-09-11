"use server";

import { apiDelete, apiGet, apiList, apiPost } from "@/libs/ApiClient";
import { GajiProps } from "@/types";

/**
 * Finance > Gaji — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Seluruh mesin perhitungan gaji (rekap absensi, komponen per department,
 * potongan BPJS/JHT/JP, PPH21 TER berikut pengurang pajak THR) sekarang di
 * backend pada `Support\PerhitunganGaji`. Generate gaji menulis `gaji_pegawai`,
 * rincian `gaji`, dan `pph21` dalam satu transaksi.
 */

export type ExportGajiProps = {
  listKomponen: {
    id: number;
    komponen: string;
    tipe: string;
  }[];
  listGaji: {
    id: number;
    nama: string;
    status_nikah: string;
    no_rek: string;
    position: string;
    department: {
      nama_department: string;
    };
    sub_department: {
      nama_sub_department: string;
    };
    gaji: {
      id: number;
      bulan: number;
      tahun: number;
      nominal: string;
      komponen_id: number;
      tipe: string;
    }[];
  }[];
};

export const getPegawaiGaji = async (
  department_id: number,
  bulan: number,
  tahun: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    id: number;
    nama: string;
  }[];
}> => {
  const hasil = await apiGet<{ id: number; nama: string }[]>(
    "/api/finance/gaji/pegawai",
    { department_id, bulan, tahun }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getDepartmentGaji = async (): Promise<{
  status: boolean;
  message: string;
  data: number[];
}> => {
  const hasil = await apiGet<number[]>("/api/finance/gaji/department");

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const createGaji = async (data: {
  department_id: number | string;
  bulan: number | string;
  tahun: number | string;
  list_pegawai: {
    label: string;
    value: number;
  }[];
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/finance/gaji", data);

  return { status: hasil.status, message: hasil.message };
};

export const getGaji = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: GajiProps[] | [];
}> => {
  const hasil = await apiList<GajiProps>("/api/finance/gaji", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const deleteGaji = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/finance/gaji/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const exportExcelGaji = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ExportGajiProps | {};
}> => {
  const hasil = await apiGet<ExportGajiProps>("/api/finance/gaji/export", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? {} };
};
