"use server";

import {
  apiDelete,
  apiGet,
  apiList,
  apiPatch,
  apiPost,
  jamLokal,
  tanggalLokal,
} from "@/libs/ApiClient";
import { PengajuanOvertimeProps } from "@/types";

/**
 * HR > OT Pengajuan — memanggil `ems-backend`, tanda tangan tidak berubah.
 *
 * Tabel konversi jam lembur → total yang dibayar sekarang di backend
 * (`Support\Overtime`), termasuk aturan potong satu jam untuk lembur hari libur
 * ≥ 5 jam. Satu perubahan perilaku: hari libur dibaca dari kalender department
 * pengaju saja, tidak lagi dari seluruh department.
 */

export const getPegawaiOt = async (
  sub_department_id: number
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
    "/api/hr/ot-pengajuan/pegawai",
    { sub_department_id }
  );

  return { status: hasil.status, message: hasil.message, data: hasil.data ?? [] };
};

export const createOt = async (data: {
  department_id: string | number;
  sub_department_id: string | number;
  list_pegawai: {
    label: string;
    value: number;
  }[];
  tgl_ot: Date | null;
  jam_awal: Date | null;
  jam_akhir: Date | null;
  job_desc: string;
  remarks: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPost("/api/hr/ot-pengajuan", {
    department_id: data.department_id,
    sub_department_id: data.sub_department_id,
    list_pegawai: data.list_pegawai,
    tgl_ot: await tanggalLokal(data.tgl_ot),
    jam_awal: await jamLokal(data.jam_awal),
    jam_akhir: await jamLokal(data.jam_akhir),
    job_desc: data.job_desc,
    remarks: data.remarks,
  });

  return { status: hasil.status, message: hasil.message };
};

export const getPengajuanOt = async (
  search?: string,
  filter?: {
    department: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: PengajuanOvertimeProps[] | [];
}> => {
  const hasil = await apiList<PengajuanOvertimeProps>("/api/hr/ot-pengajuan", {
    search,
    department: filter?.department,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};

export const deletePengajuanOt = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiDelete(`/api/hr/ot-pengajuan/${id}`);

  return { status: hasil.status, message: hasil.message };
};

export const approvalPengajuanOt = async (
  id: number,
  status: number
): Promise<{
  status: boolean;
  message: string;
}> => {
  const hasil = await apiPatch(`/api/hr/ot-pengajuan/${id}/approval`, { status });

  return { status: hasil.status, message: hasil.message };
};
