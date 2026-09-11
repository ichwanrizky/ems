"use server";

import { apiList } from "@/libs/ApiClient";
import { ReportAttdProps } from "@/types";

/**
 * HR > Report Absensi per Bulan — memanggil `ems-backend`, tanda tangan tidak
 * berubah.
 *
 * Seluruh perhitungan rekap (hadir, alpa, telat, cuti/izin/sakit, gatepass,
 * lembur) pindah ke backend. Satu perbaikan ikut terbawa: `workdate_count`
 * sekarang memakai tanggal merah department yang dilaporkan — versi lama
 * memakai `department_id: 1` yang dipatok mati, sehingga jumlah hari kerja
 * department lain bisa meleset.
 */

export const getReportAttdBulan = async (
  search?: string,
  filter?: {
    department: string | number;
    tahun: string | number;
    bulan: string | number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ReportAttdProps[];
}> => {
  const hasil = await apiList<ReportAttdProps>("/api/hr/report-absensi/bulan", {
    search,
    department: filter?.department,
    bulan: filter?.bulan,
    tahun: filter?.tahun,
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};
