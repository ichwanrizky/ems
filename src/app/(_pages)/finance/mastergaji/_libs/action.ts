"use server";

import { apiGet, apiPut } from "@/libs/ApiClient";

/** Finance > Master Gaji — memanggil `ems-backend`, tanda tangan tidak berubah. */

type MasterGajiProps = {
  id: number;
  nama: string;
  status_nikah: string;
  type_gaji: string;
  is_tax: boolean;
  master_gaji_pegawai: {
    id: number;
    nominal: number;
    komponen: {
      id: number;
      komponen: string;
    };
  }[];
};

type KomponenProps = {
  id: number;
  komponen: string;
};

export const getMasterGaji = async (
  search: string,
  filter: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: MasterGajiProps[] | [];
  komponen: KomponenProps[] | [];
}> => {
  // Dua sumber: daftar pegawai beserta nominalnya, dan daftar komponen master
  // untuk header tabel. Backend sudah mengisi baris kosong bagi pegawai yang
  // belum punya master gaji.
  const [pegawai, komponen] = await Promise.all([
    apiGet<MasterGajiProps[]>("/api/finance/master-gaji", {
      search,
      department: filter.department,
    }),
    apiGet<KomponenProps[]>("/api/finance/master-gaji/komponen", {
      department: filter.department,
    }),
  ]);

  return {
    status: pegawai.status,
    message: pegawai.message,
    data: pegawai.data ?? [],
    // Hanya komponen master yang boleh diisi nominalnya per pegawai; sisanya
    // (informasi & hasil hitungan) tidak punya kolom input di tabel ini.
    komponen: (komponen.data ?? []).filter((item: any) => item.is_master === true),
  };
};

export const updateMasterGaji = async (
  data: MasterGajiProps[]
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPut("/api/finance/master-gaji", { data });

  return { status: hasil.status, message: hasil.message };
};
