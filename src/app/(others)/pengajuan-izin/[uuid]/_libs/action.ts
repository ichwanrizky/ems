"use server";

import { apiFetch, tanggalLokal } from "@/libs/ApiClient";

/**
 * Form pengajuan izin bersesi — memanggil `ems-backend` TANPA token.
 *
 * Yang menggantikan login adalah baris `request_session_izin`: aplikasi mobile
 * memintanya lebih dulu, lalu membuka tautan berisi uuid-nya. Sesi berumur satu
 * jam dan sekali pakai — backend menandainya `expired` begitu pengajuan masuk.
 *
 * Berkas surat keterangan sakit tidak lagi ditulis ke `public/izin/`: backend
 * menyimpannya di luar document root dan menyajikannya lewat endpoint
 * `/api/publik/pengajuan-izin/{uuid}/berkas`.
 */

export const getRequestPengajuanIzin = async (
  uuid: string
): Promise<{
  status: boolean;
  message: string;
  data: {
    pegawai: {
      id: number;
      nama: string;
      department: {
        id: number;
        nama_department: string;
      };
      sub_department: {
        id: number | null;
        nama_sub_department: string | null;
      };
    };
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
  const hasil = await apiFetch<any>(
    `/api/publik/pengajuan-izin/${encodeURIComponent(uuid)}`,
    { tanpaToken: true }
  );

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? (null as any),
  };
};

export const createPengajuanIzin = async (data: {
  uuid: string;
  department_id: string | number;
  pegawai_id: string | number;
  jenis_izin: string;
  tgl_izin: Date | null;
  is_jam: boolean;
  is_hari: boolean;
  jumlah_hari: number;
  jumlah_jam: number;
  keterangan: string;
  mc_base64: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  // `department_id` dan `pegawai_id` tidak ikut dikirim: backend mengambilnya
  // dari sesi. Endpoint ini terbuka, jadi mempercayai body berarti siapa pun
  // yang memegang satu tautan bisa mengajukan izin atas nama pegawai lain.
  const hasil = await apiFetch(
    `/api/publik/pengajuan-izin/${encodeURIComponent(data.uuid)}`,
    {
      method: "POST",
      tanpaToken: true,
      body: {
        jenis_izin: data.jenis_izin,
        tgl_izin: await tanggalLokal(data.tgl_izin),
        is_jam: data.is_jam,
        is_hari: data.is_hari,
        jumlah_hari: data.jumlah_hari,
        jumlah_jam: data.jumlah_jam,
        keterangan: data.keterangan,
        mc_base64: data.mc_base64,
      },
    }
  );

  return { status: hasil.status, message: hasil.message };
};
