"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import {
  PoKeluarItemProps,
  PoKeluarProps,
  QuotationCurrency,
  CustomerProps,
  TtdProps,
} from "@/types";
import { ErrorForm, validasiPoKeluar } from "./skema";

/**
 * Sales > PO Keluar.
 *
 * Perhatikan yang TIDAK ada di sini: perhitungan subtotal/PPN/PPh/total. Angka
 * yang tampil di form cuma pratinjau; yang tersimpan dan yang tercetak dihitung
 * ulang backend dari item. Jangan menambahkan perhitungan "supaya hemat
 * request" — begitu dua tempat menghitung hal yang sama, keduanya akan berbeda
 * suatu hari.
 */

export type PoKeluarFormProps = {
  customer_id: number | string;
  /** Diisi user, 0 = bukan revisi. Bukan hitungan otomatis sistem. */
  revisi: number | string;
  tanggal: string;
  /** "" = tanpa tanggal kirim; sebagian PO jasa memang tidak punya. */
  tanggal_kirim: string;
  attn: string;
  perihal: string;
  syarat_pembayaran: string;
  catatan: string;
  diskon_persen: number | string;
  ppn_persen: number | string;
  pph_persen: number | string;
  pph_dasar: "item" | "total";
  currency: QuotationCurrency;
  /** Penanda tangan dari master `ttd`. 0 / "" = tanpa tanda tangan. */
  ttd_id: number | string;
  item: PoKeluarItemProps[];
};

export type PoKeluarFilterProps = {
  tahun: string | number;
};

/** `error` diisi hanya kalau zod yang menolak; penolakan backend cuma `message`. */
type HasilSimpan = {
  status: boolean;
  message: string;
  error?: ErrorForm;
};

/**
 * Bentuk yang diterima backend.
 *
 * Ditulis sebagai "BUANG yang dihitung server", bukan "pilih yang dikirim" —
 * pelajaran dari modul quotation, di mana daftar field yang disebut satu per
 * satu menelan field baru tanpa suara: `judul` sempat sudah ada di model, form,
 * skema zod, dan backend, tapi tidak pernah sampai ke server karena lupa
 * ditambahkan di daftar itu. Formnya terlihat bekerja dan centangnya hilang
 * saat disimpan tanpa pesan kesalahan apa pun.
 *
 * Dengan bentuk ini, field baru ikut terkirim dengan sendirinya; yang perlu
 * diingat cuma menambahkan ke daftar buang kalau memang milik server.
 */
const untukKirim = (data: PoKeluarFormProps) => ({
  ...data,
  // id/urut/jumlah dihitung backend — `jumlah` malah SENGAJA diabaikan di sana,
  // karena total tidak boleh ditentukan client.
  item: data.item.map(({ id, urut, jumlah, ...sisa }) => sisa),
});

export const getPoKeluar = async (
  search?: string,
  filter?: PoKeluarFilterProps,
  currentPage?: number,
  itemPerPage?: number,
): Promise<{
  status: boolean;
  message: string;
  data: PoKeluarProps[];
  total_data: number;
}> => {
  const hasil = await apiList<PoKeluarProps>("/api/sales/po-keluar", {
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

export const getPoKeluarId = async (
  id: number,
): Promise<{
  status: boolean;
  message: string;
  data: PoKeluarProps | null;
}> => {
  const hasil = await apiGet<PoKeluarProps>(`/api/sales/po-keluar/${id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

/**
 * Pemasok untuk dropdown form — diambil dari master CUSTOMER.
 *
 * Bukan salah endpoint: PO Keluar mengambil lawan transaksinya dari `customer`,
 * master yang sama dengan quotation, karena begitulah sistem lama bekerja dan
 * begitu pula datanya datang (`tb_po2.cust_id` berisi id baris `tb_customer`).
 * Di layar dan di cetakan ia tetap disebut "supplier" — itu perannya pada
 * dokumen ini, bukan tabel yang berbeda.
 *
 * Endpointnya menerima pemegang akses view pada quotation, PO masuk, ATAU PO
 * keluar, jadi orang yang cuma boleh membuat PO tetap dapat daftarnya.
 */
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

/**
 * Daftar penanda tangan untuk dropdown di form ini.
 *
 * Didefinisikan di sini, bukan diimpor dari modul Tanda Tangan, mengikuti pola
 * `getCustomerPilihan` di atas: tiap modul memanggil endpoint yang dibutuhkan
 * formnya sendiri. Backend sengaja melonggarkan aksesnya ke menu PO keluar,
 * jadi orang yang boleh membuat PO tetap dapat isinya walau menu master tanda
 * tangan tidak dibuka untuk dia.
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
    data: Array.isArray(hasil.data) ? hasil.data : [],
  };
};

export const createPoKeluar = async (
  data: PoKeluarFormProps,
): Promise<HasilSimpan> => {
  const periksa = validasiPoKeluar(data);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPost("/api/sales/po-keluar", untukKirim(data));

  return { status: hasil.status, message: hasil.message };
};

export const editPoKeluar = async (
  data: PoKeluarFormProps & { id: number | null },
): Promise<HasilSimpan> => {
  const { id, ...body } = data;

  const periksa = validasiPoKeluar(body);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPut(`/api/sales/po-keluar/${id}`, untukKirim(body));

  return { status: hasil.status, message: hasil.message };
};

export const deletePoKeluar = async (
  id: number,
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/sales/po-keluar/${id}`);

  return { status: hasil.status, message: hasil.message };
};

/**
 * Tahun yang ADA datanya, untuk mengisi filter tahun.
 *
 * Dropdown-nya tidak boleh menebak rentang dari kalender: data impor
 * `sistempanji` jauh lebih tua dari tahun berjalan, dan tahun yang tidak ada di
 * dropdown berarti barisnya tidak terjangkau sama sekali — bukan sekadar tidak
 * terlihat.
 */
export const getTahun = async (): Promise<number[]> => {
  const hasil = await apiGet<number[]>("/api/sales/po-keluar/tahun");

  return Array.isArray(hasil.data) ? hasil.data : [];
};
