"use server";

import { apiList, tanggalLokal } from "@/libs/ApiClient";
import { ReportAttdProps } from "@/types";

/**
 * HR > Report Absensi per Tanggal — memanggil `ems-backend`, tanda tangan tidak
 * berubah. Perhitungannya sama persis dengan laporan per bulan; bedanya cuma
 * periodenya bebas. Backend membatasi rentang maksimal 366 hari.
 */

export const getReportAttdTanggal = async (
  search?: string,
  filter?: {
    department: string | number;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ReportAttdProps[];
}> => {
  const hasil = await apiList<ReportAttdProps>("/api/hr/report-absensi/tanggal", {
    search,
    department: filter?.department,
    startDate: await tanggalLokal(filter?.startDate),
    endDate: await tanggalLokal(filter?.endDate),
  });

  return { status: hasil.status, message: hasil.message, data: hasil.data };
};
