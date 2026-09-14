"use server";

import {
  apiDelete,
  apiGet,
  apiList,
  apiPost,
  apiPut,
  getAccessToken,
} from "@/libs/ApiClient";
import { TtdProps } from "@/types";
import { validasiTtd } from "./skema";

/**
 * Sales > Tanda Tangan — master penanda tangan dokumen.
 *
 * Alurnya dua langkah, sengaja: gambarnya diunggah LEBIH DULU
 * (`unggahGambarTtd`) dan mengembalikan uuid, baru barisnya disimpan dengan
 * uuid itu. Menyatukannya jadi satu request multipart berarti validasi zod
 * tidak bisa dipakai (formData tidak melewati `apiPost`), dan pratinjau
 * sebelum simpan tidak mungkin.
 *
 * Berkas yang terunggah lalu formnya ditinggal pergi menjadi yatim; backend
 * menyapunya sendiri pada unggahan berikutnya.
 */

export type TtdFormProps = {
  nama: string;
  jabatan: string;
  /**
   * uuid hasil unggah. Wajib saat create; saat edit boleh kosong yang berarti
   * "gambarnya tidak diganti".
   */
  gambar_uuid: string;
};

export type HasilSimpan = {
  status: boolean;
  message: string;
  error?: Record<string, string>;
};

export const getTtd = async (
  search?: string,
  currentPage?: number,
  itemPerPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: TtdProps[];
  total_data: number;
}> => {
  const hasil = await apiList<TtdProps>("/api/sales/ttd", {
    search,
    page: currentPage,
    limit: itemPerPage,
  });

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data,
    total_data: hasil.total_data,
  };
};

export const getTtdId = async (
  id: number
): Promise<{ status: boolean; message: string; data: TtdProps | null }> => {
  const hasil = await apiGet<TtdProps>(`/api/sales/ttd/${id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

/**
 * Daftar ringkas untuk dropdown di form Quotation dan PO Keluar.
 *
 * Terpisah dari `getTtd()` supaya halaman masternya tetap berpaginasi
 * sementara form dokumen melihat seluruh tanda tangan sekaligus — dan
 * aksesnya di backend memang lebih longgar: yang boleh membuat dokumen harus
 * bisa memilih penanda tangan walau menu masternya tidak dibuka untuk dia.
 */
export const getTtdPilihan = async (): Promise<{
  status: boolean;
  message: string;
  data: TtdProps[];
}> => {
  const hasil = await apiGet<TtdProps[]>("/api/sales/ttd/pilihan");

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? [],
  };
};

/**
 * Unggah satu gambar tanda tangan (coretan canvas atau pindaian).
 *
 * Tidak lewat `apiPost`: backend menerima multipart, sementara `ApiClient`
 * selalu mengirim JSON. Yang diteruskan FormData mentah dari browser, jadi
 * berkasnya tidak perlu di-base64 dulu — yang akan membengkakkan payload
 * sepertiga dan memakan memori server action.
 */
export const unggahGambarTtd = async (
  form: FormData
): Promise<{ status: boolean; message: string; uuid: string | null }> => {
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  const token = await getAccessToken();

  if (!base) {
    return {
      status: false,
      message: "Konfigurasi server belum lengkap",
      uuid: null,
    };
  }

  if (!token) {
    return {
      status: false,
      message: "Sesi berakhir, silakan login ulang",
      uuid: null,
    };
  }

  try {
    const response = await fetch(`${base}/api/sales/ttd/gambar`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    const hasil = await response.json();

    return {
      status: !!hasil?.status,
      message: hasil?.message ?? "Gagal mengunggah tanda tangan",
      uuid: hasil?.data?.uuid ?? null,
    };
  } catch (error) {
    console.error("Gagal mengunggah tanda tangan:", error);

    return {
      status: false,
      message: "Tidak dapat terhubung ke server",
      uuid: null,
    };
  }
};

export const createTtd = async (data: TtdFormProps): Promise<HasilSimpan> => {
  const { gambar_uuid, ...isi } = data;

  const periksa = validasiTtd(isi);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  // Diperiksa di sini juga, bukan hanya di komponen: gambar yang belum
  // terunggah menghasilkan baris tanda tangan tanpa gambar, dan itu baru
  // ketahuan saat PDF dicetak.
  if (!gambar_uuid) {
    return {
      status: false,
      message: "Tanda tangan belum digambar atau diunggah",
      error: { gambar: "Tanda tangan wajib diisi" },
    };
  }

  const hasil = await apiPost("/api/sales/ttd", { ...periksa.data, gambar_uuid });

  return { status: hasil.status, message: hasil.message };
};

export const editTtd = async (
  data: TtdFormProps & { id: number | null }
): Promise<HasilSimpan> => {
  const { id, gambar_uuid, ...isi } = data;

  const periksa = validasiTtd(isi);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  // `gambar_uuid` kosong sah di sini: menyunting nama atau jabatan tidak
  // mengharuskan tanda tangannya digambar ulang.
  const hasil = await apiPut(`/api/sales/ttd/${id}`, {
    ...periksa.data,
    gambar_uuid,
  });

  return { status: hasil.status, message: hasil.message };
};

export const deleteTtd = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/sales/ttd/${id}`);

  return { status: hasil.status, message: hasil.message };
};
