"use server";

import { apiDelete, apiGet, apiList, apiPost, apiPut } from "@/libs/ApiClient";
import { CustomerProps } from "@/types";
import { validasiCustomer } from "./skema";

/** Sales > Customer — master pelanggan yang dipakai modul Quotation. */

export type CustomerFormProps = {
  kode: string;
  nama_customer: string;
  alamat: string;
  telp: string;
  email: string;
};

/**
 * Hasil simpan. `error` berisi pesan per field ketika yang gagal adalah
 * validasi bentuk — komponen memasangnya di bawah masing-masing input alih-alih
 * menampilkan satu alert yang tidak menunjuk ke mana pun.
 */
export type HasilSimpan = {
  status: boolean;
  message: string;
  error?: Record<string, string>;
};

export const getCustomer = async (
  search?: string,
  currentPage?: number,
  itemPerPage?: number
): Promise<{
  status: boolean;
  message: string;
  data: CustomerProps[];
  total_data: number;
}> => {
  const hasil = await apiList<CustomerProps>("/api/sales/customer", {
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

export const getCustomerId = async (
  id: number
): Promise<{
  status: boolean;
  message: string;
  data: CustomerProps | null;
}> => {
  const hasil = await apiGet<CustomerProps>(`/api/sales/customer/${id}`);

  return {
    status: hasil.status,
    message: hasil.message,
    data: hasil.data ?? null,
  };
};

/** Usulan kode dari nama customer. Keunikannya tetap diperiksa saat simpan. */
export const generateKodeCustomer = async (
  nama: string
): Promise<{ status: boolean; message: string; kode: string | null }> => {
  const hasil = await apiGet<{ kode: string }>("/api/sales/customer/kode", {
    nama,
  });

  return {
    status: hasil.status,
    message: hasil.message,
    kode: hasil.data?.kode ?? null,
  };
};

export const createCustomer = async (
  data: CustomerFormProps
): Promise<HasilSimpan> => {
  const periksa = validasiCustomer(data);

  if (!periksa.sukses) {
    return { status: false, message: "Periksa kembali isian form", error: periksa.error };
  }

  const hasil = await apiPost("/api/sales/customer", periksa.data);

  return { status: hasil.status, message: hasil.message };
};

export const editCustomer = async (
  data: CustomerFormProps & { id: number | null }
): Promise<HasilSimpan> => {
  const { id, ...body } = data;

  const periksa = validasiCustomer(body);

  if (!periksa.sukses) {
    return { status: false, message: "Periksa kembali isian form", error: periksa.error };
  }

  const hasil = await apiPut(`/api/sales/customer/${id}`, periksa.data);

  return { status: hasil.status, message: hasil.message };
};

export const deleteCustomer = async (
  id: number
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/sales/customer/${id}`);

  return { status: hasil.status, message: hasil.message };
};
