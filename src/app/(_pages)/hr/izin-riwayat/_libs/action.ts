"use server";

import { apiDelete, apiGet, apiList, apiPost, tanggalLokal } from "@/libs/ApiClient";
import { RiwayatIzinProps } from "@/types";

/**
 * HR > Izin Riwayat — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Penjabaran pengajuan menjadi baris `izin` harian (termasuk melewati tanggal
 * merah) sekarang di backend, dipakai bersama oleh approval dan input langsung.
 */

export const getRiwayatIzin = async (
  search?: string,
  filter?: {
    department: string | number;
    bulan: number | string;
    tahun: number | string;
  },
  currentPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: RiwayatIzinProps[] | [];
  total_data: number;
}> => {
  return (await apiList<RiwayatIzinProps>("/api/hr/izin-riwayat", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
    page: currentPage,
  })) as any;
};

export const deleteRiwayatIzin = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/izin-riwayat/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const getPegawaiIzin = async (
  department_id: number
): Promise<{
  status: boolean;
  message: string;
  data:
    | {
        id: number;
        nama: string;
      }[];
}> => {
  const hasil = await apiGet<{ id: number; nama: string }[]>(
    "/api/hr/izin-riwayat/pegawai",
    { department_id }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const getPegawaiIzinTglMerah = async (
  pegawai_id: number
): Promise<{
  status: boolean;
  message: string;
  data: {
    jenis_izin: {
      kode: string;
      jenis: string;
      is_jam: boolean;
    }[];
    tgl_merah: {
      tanggal: Date | null;
      tanggal_nomor: string;
    }[];
  };
}> => {
  const hasil = await apiGet<any>(`/api/hr/izin-riwayat/referensi/${pegawai_id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? (null as any),
  };
};

export const createIizin = async (data: {
  department_id: string | number;
  pegawai_id: string | number;
  jenis_izin: string;
  tgl_izin: Date | null;
  is_jam: boolean;
  is_hari: boolean;
  jumlah_hari: number;
  jumlah_jam: number;
  keterangan: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/hr/izin-riwayat", {
    ...data,
    tgl_izin: await tanggalLokal(data.tgl_izin),
  });

  return { status: hasil.status, message: hasil.message };
};
