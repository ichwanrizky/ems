"use server";

import {
  apiDelete,
  apiGet,
  apiList,
  apiPost,
  apiPut,
  getAccessToken,
} from "@/libs/ApiClient";
import {
  CustomerProps,
  PoBerkasProps,
  PoMasukProps,
  QuotationCurrency,
  QuotationPilihanProps,
} from "@/types";
import { ErrorForm, validasiPoMasuk } from "./skema";

/**
 * Sales > PO Masuk — arsip purchase order yang diterima dari customer.
 *
 * Perhatikan yang TIDAK ada di sini: item. Yang mengikat adalah berkas dari
 * customer, dan mengetik ulang isinya cuma menciptakan versi kedua yang bisa
 * berbeda dari aslinya — begitu keduanya berbeda tidak ada yang tahu mana yang
 * benar sampai berkasnya dibuka.
 */

export type PoMasukFormProps = {
  /** Nomor milik customer, diketik apa adanya. Bukan penomoran kita. */
  nomor: string;
  tanggal: string;
  customer_id: number | string;
  /** Penawaran yang dijawab PO ini. Kosong = datang tanpa penawaran. */
  quotation_id: number | string | null;
  perihal: string;
  requestor: string;
  /** "" = tanpa nilai, berbeda artinya dari 0. */
  nilai: number | "";
  currency: QuotationCurrency;
  catatan: string;
  berkas: PoBerkasProps[];
};

export type PoMasukFilterProps = {
  tahun: string | number;
};

/** `error` diisi hanya kalau zod yang menolak; penolakan backend cuma `message`. */
type HasilSimpan = {
  status: boolean;
  message: string;
  error?: ErrorForm;
};

/** Bentuk yang diterima backend: berkas dikirim sebagai daftar uuid saja. */
const untukKirim = (data: PoMasukFormProps) => ({
  ...data,
  berkas: (data.berkas ?? []).map((b) => b.uuid),
});

export const getPoMasuk = async (
  search?: string,
  filter?: PoMasukFilterProps,
  currentPage?: number,
  itemPerPage?: number,
): Promise<{
  status: boolean;
  message: string;
  data: PoMasukProps[];
  total_data: number;
}> => {
  const hasil = await apiList<PoMasukProps>("/api/sales/po-masuk", {
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

export const getPoMasukId = async (
  id: number,
): Promise<{
  status: boolean;
  message: string;
  data: PoMasukProps | null;
}> => {
  const hasil = await apiGet<PoMasukProps>(`/api/sales/po-masuk/${id}`);

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

/**
 * Penawaran milik satu customer, untuk dropdown "PO ini menjawab yang mana".
 *
 * Disaring per customer karena itulah satu-satunya cara daftarnya bisa dipakai:
 * ada 5.000-an penawaran, dan dropdown yang memuat semuanya tidak membantu
 * siapa pun. Backend membatasi 50 baris terbaru; yang lebih lama dicari lewat
 * `search`.
 */
export const getQuotationPilihan = async (
  customerId: number | string,
  search?: string,
): Promise<{
  status: boolean;
  message: string;
  data: QuotationPilihanProps[];
}> => {
  if (!customerId) {
    return { status: true, message: "", data: [] };
  }

  const hasil = await apiGet<QuotationPilihanProps[]>(
    "/api/sales/po-masuk/quotation",
    { customer_id: customerId, search },
  );

  return {
    status: hasil.status,
    message: hasil.message,
    data: Array.isArray(hasil.data) ? hasil.data : [],
  };
};

export const createPoMasuk = async (
  data: PoMasukFormProps,
): Promise<HasilSimpan> => {
  const periksa = validasiPoMasuk(data);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPost("/api/sales/po-masuk", untukKirim(data));

  return { status: hasil.status, message: hasil.message };
};

export const editPoMasuk = async (
  data: PoMasukFormProps & { id: number | null },
): Promise<HasilSimpan> => {
  const { id, ...body } = data;

  const periksa = validasiPoMasuk(body);

  if (!periksa.sukses) {
    return {
      status: false,
      message: "Periksa kembali isian form",
      error: periksa.error,
    };
  }

  const hasil = await apiPut(`/api/sales/po-masuk/${id}`, untukKirim(body));

  return { status: hasil.status, message: hasil.message };
};

/**
 * Unggah satu berkas arsip.
 *
 * Tidak lewat `apiPost`: backend menerima multipart, sementara `ApiClient`
 * selalu mengirim JSON. Yang diteruskan ke sana FormData mentah dari browser,
 * jadi berkasnya tidak perlu di-base64 dulu (yang akan membengkakkan payload
 * sepertiga dan memakan memori server action — berkas PO bisa 15 MB).
 *
 * Dipanggil SEBELUM barisnya tersimpan — berkasnya lahir "yatim" di backend
 * lalu diklaim saat disimpan. Ini juga alasan simpannya JSON dan bukan
 * multipart: PHP tidak mem-parse multipart pada request PUT sama sekali.
 */
export const unggahBerkasPo = async (
  form: FormData,
): Promise<{
  status: boolean;
  message: string;
  berkas: PoBerkasProps | null;
}> => {
  const base = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  const token = await getAccessToken();

  if (!base) {
    return {
      status: false,
      message: "Konfigurasi server belum lengkap",
      berkas: null,
    };
  }

  if (!token) {
    return {
      status: false,
      message: "Sesi berakhir, silakan login ulang",
      berkas: null,
    };
  }

  try {
    const response = await fetch(`${base}/api/sales/po-masuk/berkas`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    const hasil = await response.json();

    return {
      status: !!hasil?.status,
      message: hasil?.message ?? "Gagal mengunggah berkas",
      berkas: hasil?.data?.uuid
        ? {
            uuid: hasil.data.uuid,
            nama_asli: hasil.data.nama_asli ?? "",
            tipe: hasil.data.tipe ?? "",
            ukuran: hasil.data.ukuran ?? 0,
          }
        : null,
    };
  } catch (error) {
    console.error("Gagal mengunggah berkas PO:", error);

    return {
      status: false,
      message: "Tidak dapat terhubung ke server",
      berkas: null,
    };
  }
};

export const deletePoMasuk = async (
  id: number,
): Promise<{ status: boolean; message: string }> => {
  const hasil = await apiDelete(`/api/sales/po-masuk/${id}`);

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
  const hasil = await apiGet<number[]>("/api/sales/po-masuk/tahun");

  return Array.isArray(hasil.data) ? hasil.data : [];
};
