"use server";

import {
  apiDelete,
  apiGet,
  apiList,
  apiPost,
  apiPut,
  getAccessToken,
} from "@/libs/ApiClient";
import { CustomerProps, QuotationGrupProps, QuotationProps } from "@/types";
import { ErrorForm, validasiQuotation } from "./skema";

/**
 * Sales > Quotation.
 *
 * Perhatikan yang TIDAK ada di sini: perhitungan subtotal/PPN/PPh/total. Angka
 * yang tampil di form cuma pratinjau; yang tersimpan dan yang tercetak dihitung
 * ulang backend dari item. Jangan menambahkan perhitungan "supaya hemat
 * request" — begitu dua tempat menghitung hal yang sama, keduanya akan berbeda
 * suatu hari.
 */

export type QuotationFormProps = {
  customer_id: number | string;
  /** Diisi user, 0 = bukan revisi. Bukan hitungan otomatis sistem. */
  revisi: number | string;
  tanggal: string;
  berlaku_sampai: string;
  attn: string;
  perihal: string;
  syarat_pembayaran: string;
  catatan: string;
  diskon_persen: number | string;
  ppn_persen: number | string;
  pph_persen: number | string;
  pph_dasar: "item" | "total";
  tampilkan_grand_total: boolean;
  grup: QuotationGrupProps[];
};

export type QuotationFilterProps = {
  tahun: string | number;
};

/** `error` diisi hanya kalau zod yang menolak; penolakan backend cuma `message`. */
type HasilSimpan = {
  status: boolean;
  message: string;
  error?: ErrorForm;
};

/** Bentuk yang diterima backend: gambar dikirim sebagai daftar uuid saja. */
const untukKirim = (data: QuotationFormProps) => ({
  ...data,
  grup: data.grup.map((g) => ({
    nama: g.nama,
    item: g.item.map((i) => ({
      deskripsi: i.deskripsi,
      satuan: i.satuan,
      qty: i.qty,
      harga: i.harga,
      diskon_persen: i.diskon_persen,
      kena_pph: i.kena_pph,
      gambar: (i.gambar ?? []).map((g) => g.uuid),
    })),
  })),
});

export const getQuotation = async (
  search?: string,
  filter?: QuotationFilterProps,
  currentPage?: number,
  itemPerPage?: number,
): Promise<{
  status: boolean;
  message: string;
  data: QuotationProps[];
  total_data: number;
}> => {
  const hasil = await apiList<QuotationProps>("/api/sales/quotation", {
    search,
    tahun: filter?.tahun,
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

export const getQuotationId = async (
  id: number,
): Promise<{
  status: boolean;
  message: string;
  data: QuotationProps | null;
}> => {
  const hasil = await apiGet<QuotationProps>(`/api/sales/quotation/${id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

/** Customer untuk dropdown form — dijaga akses menu quotation, bukan customer. */
export const getCustomerPilihan = async (): Promise<{
  status: boolean;
  message: string;
  data: CustomerProps[];
}> => {
  const hasil = await apiGet<CustomerProps[]>("/api/sales/customer/pilihan");

  return {
    status: hasil.status,
    message: hasil.message,
    data: Array.isArray(hasil.data) ? hasil.data : [],
  };
};

export const createQuotation = async (
  data: QuotationFormProps,
): Promise<HasilSimpan> => {
  const periksa = validasiQuotation(data);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPost("/api/sales/quotation", untukKirim(periksa.data));

  return { status: hasil.status, message: hasil.message };
};

export const editQuotation = async (
  data: QuotationFormProps & { id: number | null },
): Promise<HasilSimpan> => {
  const { id, ...body } = data;

  const periksa = validasiQuotation(body);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPut(
    `/api/sales/quotation/${id}`,
    untukKirim(periksa.data),
  );

  return { status: hasil.status, message: hasil.message };
};

/**
 * Unggah satu gambar lampiran item.
 *
 * Tidak lewat `apiPost`: backend menerima multipart, sementara `ApiClient`
 * selalu mengirim JSON. Yang diteruskan ke sana FormData mentah dari browser,
 * jadi berkasnya tidak perlu di-base64 dulu (yang akan membengkakkan payload
 * sepertiga dan memakan memori server action).
 *
 * Dipanggil SEBELUM penawarannya tersimpan — barisnya lahir "yatim" di backend
 * lalu diklaim saat disimpan.
 */
export const unggahGambarQuotation = async (
  form: FormData,
): Promise<{
  status: boolean;
  message: string;
  uuid: string | null;
  nama_asli: string;
}> => {
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  const token = await getAccessToken();

  if (!base) {
    return {
      status: false,
      message: "Konfigurasi server belum lengkap",
      uuid: null,
      nama_asli: "",
    };
  }

  if (!token) {
    return {
      status: false,
      message: "Sesi berakhir, silakan login ulang",
      uuid: null,
      nama_asli: "",
    };
  }

  try {
    const response = await fetch(`${base}/api/sales/quotation/gambar`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    const hasil = await response.json();

    return {
      status: !!hasil?.status,
      message: hasil?.message ?? "Gagal mengunggah gambar",
      uuid: hasil?.data?.uuid ?? null,
      nama_asli: hasil?.data?.nama_asli ?? "",
    };
  } catch (error) {
    console.error("Gagal mengunggah gambar quotation:", error);

    return {
      status: false,
      message: "Tidak dapat terhubung ke server",
      uuid: null,
      nama_asli: "",
    };
  }
};

export const duplikatQuotation = async (
  id: number,
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiPost(`/api/sales/quotation/${id}/duplikat`);

  return { status: hasil.status, message: hasil.message };
};

export const deleteQuotation = async (
  id: number,
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/sales/quotation/${id}`);

  return { status: hasil.status, message: hasil.message };
};
