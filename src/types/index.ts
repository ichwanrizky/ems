export type isLoadingProps = {
  [key: number]: boolean;
};

export type MenuGroupProps = {
  id: number;
  menu_group: string;
  urut: number;
  group: boolean;
  parent_id: string;
};

export type AlertProps = {
  status: boolean;
  color: string;
  message: string;
  subMessage: string;
};

export type MenuProps = {
  id: number;
  menu: string;
  path: string;
  last_path: string;
  urut: number;
  menu_group_id: number;
  menu_group: MenuGroupProps;
};

export type RolesProps = {
  id: number;
  role_name: string;
};

export type DepartmentProps = {
  id: number;
  nama_department: string;
  latitude: string;
  longitude: string;
  radius: string;
  department_location?: DepartmentLocationProps[];
  akses_izin_department?: {
    jenis_izin: {
      kode: string;
      jenis: string;
    };
  }[];
};

export type DepartmentLocationProps = {
  id?: number;
  nama_lokasi?: string;
  latitude: string;
  longitude: string;
  radius: string;
  department_id?: number;
};

export type PegawaiLocationProps = {
  number?: number;
  id: number;
  nama_lokasi?: string;
  latitude: string;
  longitude: string;
  radius: string;
  pegawai_id: number;
  pegawai: {
    id: number;
    nama: string;
    department: {
      id: number;
      nama_department: string;
    };
  };
};

export type PegawaiLocationCreateProps = {
  id?: number;
  nama_lokasi?: string;
  latitude: string;
  longitude: string;
  radius: string;
  pegawai_id: number | string;
};

export type SubDepartmentProps = {
  id: number;
  nama_sub_department: string;
  department_id: number;
  department?: DepartmentProps;
  leader_user?: {
    id: number;
    name: string;
  };
  supervisor_user?: {
    id: number;
    name: string;
  };
  manager_user?: {
    id: number;
    name: string;
  };
  akses_izin?: {
    jenis_izin: {
      kode: string;
      jenis: string;
    };
  }[];
};

export type SeesionProps = {
  user: {
    id: string;
    username: string;
    name?: string;
    role_id: number;
    role_name: string;
    /**
     * JWT terbitan ems-backend, dipakai `libs/ApiClient` untuk memanggil API.
     * Hanya ada di sisi server — jangan diteruskan ke komponen client.
     */
    accessToken?: string;
    access_department: AccessDepartmentProps;
    access_sub_department: AccessSubDepartmentProps;
    menu: {
      id: number;
      menu_group: string;
      group: boolean;
      parent_id: string;
      menu: {
        id: number;
        menu: string;
        path: string;
        access: {
          view: boolean;
          insert: boolean;
          update: boolean;
          delete: boolean;
        }[];
      }[];
    }[];
  };
};

export type AccessDepartmentProps = {
  department: {
    id: number;
    nama_department: string;
  };
}[];

export type AccessSubDepartmentProps = {
  sub_department: {
    id: number;
    nama_sub_department: string;
    department_id: number;
  };
}[];

export type AccessProps = {
  view: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
};

export type ShiftMasterProps = {
  id: number;
  jam_masuk: Date;
  jam_pulang: Date;
  keterangan: string;
  different_day: boolean;
  cond_friday: number;
  department_id: number;
  department: {
    id: number;
    nama_department: string;
  };
};

export type PegawaiProps = {
  number?: number;
  id: number;
  panji_id?: string;
  nama: string;
  nik_ktp: string;
  tmp_lahir?: string;
  tgl_lahir?: Date;
  jk: string;
  agama?: string;
  kebangsaan?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  kel?: string;
  kec?: string;
  kota?: string;
  telp: string;
  status_nikah: string;
  email?: string;
  position?: string;
  npwp?: string;
  jenis_bank?: string;
  no_rek?: string;
  bpjs_tk?: string;
  bpjs_kes?: string;
  department_id: number;
  department: {
    id: number;
    nama_department: string;
  };
  sub_department_id?: number;
  sub_department?: {
    id: number;
    nama_sub_department: string;
  };
  shift_id?: number;
  shift?: {
    id: number;
    nama_shift: string;
  };
  tgl_join?: Date;
  is_active: boolean;
  is_overtime: boolean;
  user: {
    id: number;
    is_deleted: boolean;
  }[];
};

export type PegawaiCreateProps = {
  id: number;
  department_id: number;
  sub_department_id: number | null;
  panji_id: string;
  nama: string;
  nik_ktp: string | number;
  position: string;
  tmp_lahir: string;
  tgl_lahir: Date | null;
  jk: string;
  agama: string;
  telp: string | number;
  email: string;
  alamat: string;
  rt: string;
  rw: string;
  kel: string;
  kec: string;
  kota: string;
  kebangsaan: string;
  status_nikah: string;
  tgl_join: Date | null;
  npwp: string;
  jenis_bank: string;
  no_rek: string;
  bpjs_tk: string;
  bpjs_kes: string;
  is_active: boolean;
  is_overtime: boolean;
  shift_id: number | null;
};

export type PegawaiShiftProps = {
  id: number;
  nama: string;
  shift_id: number | null;
};

export type AtasanProps = {
  id?: number;
  name?: string;
  username?: string;
  pegawai: {
    id: number;
    nama: string;
  };
};

export type AbsenProps = {
  id: number;
  nama: string;
  absen: {
    id: number;
    tanggal: Date;
    absen_masuk: Date;
    absen_pulang: Date;
    late: number;
  }[];
  izin: {
    jenis_izin: {
      kode: string;
      jenis: string;
      is_jam: boolean;
    };
    jumlah_jam: string;
    jumlah_hari: string;
  }[];
};

export type PengajuanIzinProps = {
  id: number;
  uuid: string;
  tanggal: Date;
  tahun: number;
  bulan: number;
  keterangan: string;
  jumlah_hari: string;
  jumlah_jam: string;
  jenis_izin: {
    kode: string;
    jenis: string;
  };
  pegawai: {
    nama: string;
    sub_department: {
      id: number;
      nama_sub_department: string;
      manager: number | null;
      supervisor: number | null;
    };
  };
  approval: boolean;
};

export type RiwayatIzinProps = {
  number: number;
  id: number;
  uuid: string;
  tanggal: Date;
  tahun: number;
  bulan: number;
  keterangan: string;
  jumlah_hari: string;
  jumlah_jam: string;
  jenis_izin: {
    kode: string;
    jenis: string;
  };
  pegawai: {
    nama: string;
  };
  user_approved: {
    name: string;
  };
  approve_date: Date;
  status: number;
};

export interface PengajuanOvertimeProps {
  id: number;
  pengajuan_overtime_pegawai: {
    pegawai: {
      id: number;
      nama: string;
    };
  }[];
  sub_department: {
    id: number;
    nama_sub_department: string;
    manager: number | null;
    supervisor: number | null;
  };
  tanggal: Date;
  jam_from: Date;
  jam_to: Date;
  job_desc: string;
  remark: string;
  approval: boolean;
}

export interface RiwayatOvertimeProps {
  number: number;
  id: number;
  pengajuan_overtime_pegawai: {
    pegawai: {
      id: number;
      nama: string;
    };
  }[];
  sub_department: {
    id: number;
    nama_sub_department: string;
    manager: number | null;
    supervisor: number | null;
  };
  tanggal: Date;
  jam_from: Date;
  jam_to: Date;
  job_desc: string;
  remark: string;
  status: number;
  user: {
    name: string;
  };
  approve_date: Date;
}

export type AttendanceMonthlyProps = {
  id: number;
  nama: string;
  tanggal: Date;
  hari: number;
  tanggal_libur: Date;
  absen_id: number;
  tanggal_absen: Date;
  absen_masuk: string;
  absen_pulang: string;
  late: number;
  izin: {
    jenis_izin_kode: string;
    jenis_izin: string;
    jumlah_jam: string;
    jumlah_hari: string;
  }[];
  tanggal_ot: Date;
  jam_ot: String;
  total_ot: String;
};

export type OvertimeMonthlyProps = {
  id: number;
  tanggal: Date;
  pegawai: {
    nama: string;
  };
  jam: string;
  total: string;
  is_holiday: boolean;
};

export type AdjustmentProps = {
  id: number;
  jenis: string;
  nominal: number;
  keterangan: string;
  pegawai: {
    id: number;
    nama: string;
  };
  department_id: number;
  bulan: number;
  tahun: number;
};

export type ThrProps = {
  id: number;
  uuid: string;
  bulan: number;
  tahun: number;
  department_id: number;
  pegawai_id: number;
  thr: number;
  pph21: number;
  net_thr: number;
  pegawai: {
    nama: string;
  };
  department: {
    nama_department: string;
  };
};

export type GajiProps = {
  id: number;
  uuid: string;
  tahun: number;
  bulan: number;
  nominal: number;
  pegawai: {
    id: number;
    nama: string;
  };
  department_id: number;
};

export type SlipGajiDataProps = {
  bulan: number;
  tahun: number;
  pegawai: {
    id: number;
    nama: string;
    status_nikah: string;
    position: string;
  };
  department: {
    nama_department: string;
  };
  gaji: {
    id: number;
    bulan: number;
    tahun: number;
    pegawai_id: number;
    tipe: string;
    komponen: string;
    komponen_id: number;
    nominal: string;
    urut: number;
    gaji_pegawai_id: number;
  }[];
  thr: number;
};

export type ReportAttdProps = {
  pegawai_id: number;
  nama: string;
  status_nikah: string;
  department_id: number;
  nama_department: string;
  sub_department_id: number;
  nama_sub_department: string;
  type_gaji: string;
  workdate_count: number;
  attend_count: number;
  attend_weekend_count: number;
  notattend_count: number;
  late_count: number;
  cuti_count: number;
  cuti_s_count: number;
  izin_count: number;
  izin_s_count: number;
  sakit_count: number;
  g1_count: number;
  g2_count: number;
  g3_count: number;
  pm_count: number;
  overtime: number;
  overtime_total: number;
};

// ---------------------------------------------------------------------------
// SALES
// ---------------------------------------------------------------------------

export type CustomerProps = {
  number?: number;
  id: number;
  kode: string;
  nama_customer: string;
  alamat: string | null;
  telp: string | null;
  email: string | null;
  /**
   * Tiga hitungan terpisah, bukan satu "jumlah dokumen": satu baris customer
   * bisa berperan dua arah — yang kita tagih lewat Quotation, dan yang kita
   * bayar lewat PO Keluar. Menjumlahkannya menyembunyikan perbedaan itu justru
   * di tempat yang paling butuh membedakannya.
   */
  jumlah_quotation?: number;
  jumlah_po_keluar?: number;
  jumlah_po_masuk?: number;
};

/**
 * Sales > Tanda Tangan — satu orang yang berhak meneken dokumen.
 *
 * Dibuat sekali di master, lalu DIPILIH berulang kali oleh Quotation dan PO
 * Keluar; yang menyusun dokumen tidak menggambar apa pun.
 *
 * `uuid` menunjuk berkas gambarnya, bukan barisnya — ia berganti setiap kali
 * gambarnya diganti, dan itu yang dipakai `/api/sales/ttd/gambar/{uuid}`.
 */
export type TtdProps = {
  number?: number;
  id: number;
  uuid: string | null;
  nama: string;
  jabatan: string | null;
  /**
   * Dua hitungan terpisah karena satu tanda tangan bisa dipakai dokumen yang
   * kita tagih (quotation) dan yang kita bayar (PO keluar). Angka inilah yang
   * membuat tombol hapus ditolak backend, jadi ia ikut tampil di daftarnya.
   */
  jumlah_quotation?: number;
  jumlah_po_keluar?: number;
};

/**
 * Tanda tangan seperti yang menempel pada satu dokumen. Null bila dokumennya
 * tidak memilih apa pun — dokumen lama, atau memang mau diteken tangan.
 */
export type TtdDokumenProps = {
  id: number;
  uuid: string | null;
  nama: string | null;
  jabatan: string | null;
};

/**
 * Mata uang dokumen — penentu simbol yang tercetak, BUKAN kurs. Nominalnya
 * disimpan apa adanya dan tidak pernah dikonversi.
 */
export type QuotationCurrency = "IDR" | "USD" | "SGD";

export type QuotationGambarProps = {
  uuid: string;
  nama_asli: string;
};

export type QuotationItemProps = {
  id?: number;
  urut?: number;
  /**
   * Baris ini JUDUL bagian, bukan barang: hanya `deskripsi` yang berarti, dan
   * qty/harga/jumlah dipaksa nol backend supaya tidak ikut dijumlahkan.
   *
   * Berbeda dari grup — grup memikul subtotal; judul cuma penanda, dan boleh
   * berkali-kali di dalam satu grup.
   */
  judul: boolean;
  deskripsi: string;
  satuan: string | null;
  qty: number | string;
  harga: number | string;
  diskon_persen: number | string;
  jumlah?: number;
  /** Ikut dasar pengenaan PPh saat pph_dasar = "item". */
  kena_pph: boolean;
  gambar: QuotationGambarProps[];
};

/** Item selalu berada di dalam grup; GRUP yang memikul subtotal. */
export type QuotationGrupProps = {
  id?: number;
  urut?: number;
  nama: string;
  subtotal?: number;
  item: QuotationItemProps[];
};

export type QuotationProps = {
  number?: number;
  id: number;
  uuid: string | null;
  nomor: string;
  /** Diisi user, 0 = bukan revisi. Bukan hitungan sistem. */
  revisi: number;
  tanggal: string;
  berlaku_sampai: string;
  perihal: string | null;
  attn: string | null;
  /** Turunan backend: `berlaku_sampai` sudah lewat. */
  kadaluarsa: boolean;
  subtotal: number;
  diskon_persen: number;
  diskon_nominal: number;
  dpp: number;
  ppn_persen: number;
  ppn_nominal: number;
  pph_persen: number;
  /** "item" = hanya item yang dicentang; "total" = seluruh DPP. */
  pph_dasar: "item" | "total";
  pph_nominal: number;
  total: number;
  /** Mati = penawaran berisi pilihan, hanya subtotal grup yang bermakna. */
  tampilkan_grand_total: boolean;
  currency: QuotationCurrency;
  syarat_pembayaran: string | null;
  catatan: string | null;
  nama_pembuat: string | null;
  /** Penanda tangan yang dipilih. Null = ruang kosong + nama pembuat di PDF. */
  ttd: TtdDokumenProps | null;
  created_at: string | null;
  customer: {
    id: number;
    kode: string | null;
    nama_customer: string | null;
    alamat: string | null;
  };
  grup?: QuotationGrupProps[];
};

/** Berkas arsip milik satu PO masuk. */
export type PoBerkasProps = {
  uuid: string;
  nama_asli: string;
  /** MIME asli — penentu ikon di daftar dan header saat berkasnya dibuka. */
  tipe: string;
  ukuran: number;
};

/** Penawaran dalam bentuk ringkas, untuk dropdown "PO ini menjawab yang mana". */
export type QuotationPilihanProps = {
  id: number;
  nomor: string;
  tanggal: string;
  perihal: string | null;
  total: number;
  currency: QuotationCurrency;
};

/**
 * PO yang DITERIMA dari customer — arsip, bukan dokumen yang kita susun.
 *
 * Tidak punya item: yang mengikat adalah berkas dari customer, dan mengetik
 * ulang isinya cuma menciptakan versi kedua yang bisa berbeda.
 */
export type PoMasukProps = {
  number?: number;
  id: number;
  uuid: string | null;
  /** Nomor milik customer, diketik apa adanya. Bukan penomoran kita. */
  nomor: string;
  tanggal: string;
  perihal: string | null;
  requestor: string | null;
  /**
   * NULL berbeda dari 0: sebagian PO memang datang tanpa nominal (rate card,
   * pesanan bertahap), dan nol yang dipaksakan terbaca sebagai "PO senilai nol".
   */
  nilai: number | null;
  currency: QuotationCurrency;
  catatan: string | null;
  nama_pembuat: string | null;
  created_at: string | null;
  customer: {
    id: number;
    kode: string | null;
    nama_customer: string | null;
    alamat: string | null;
  };
  /** Penawaran yang dijawab PO ini. NULL = datang tanpa penawaran. */
  quotation: { id: number; nomor: string | null } | null;
  berkas: PoBerkasProps[];
};

export type PoKeluarItemProps = {
  id?: number;
  urut?: number;
  /**
   * Baris ini JUDUL bagian, bukan barang: hanya `deskripsi` yang berarti, dan
   * qty/harga/jumlah dipaksa nol backend supaya tidak ikut dijumlahkan.
   */
  judul: boolean;
  deskripsi: string;
  satuan: string | null;
  qty: number | string;
  harga: number | string;
  diskon_persen: number | string;
  jumlah?: number;
  /** Ikut dasar pengenaan PPh saat pph_dasar = "item". */
  kena_pph: boolean;
  /** Keterangan singkat per baris: nomor part, lead time, merek yang diminta. */
  remarks: string | null;
};

/**
 * PO yang KITA terbitkan ke pemasok.
 *
 * Lawan transaksinya tetap `customer` — master yang sama dengan quotation dan
 * PO masuk, karena begitulah sistem lama bekerja dan begitu pula datanya datang.
 * Di layar dan di cetakan ia disebut "supplier"; itu perannya pada dokumen ini,
 * bukan tabel yang berbeda.
 *
 * Susunan nominalnya sama dengan `QuotationProps`. Yang TIDAK ada di sini dan
 * sengaja: grup item (PO tidak pernah menawarkan pilihan — semua barisnya
 * dibeli), `tampilkan_grand_total` (PO selalu punya grand total, itu yang akan
 * dibayar), dan `berlaku_sampai`/`kadaluarsa` (PO tidak kadaluarsa; ia dipenuhi
 * atau dibatalkan, dan keduanya terjadi di luar aplikasi ini).
 */
export type PoKeluarProps = {
  number?: number;
  id: number;
  uuid: string | null;
  nomor: string;
  /** Diisi user, 0 = bukan revisi. Bukan hitungan sistem. */
  revisi: number;
  tanggal: string;
  /** Kapan barangnya diminta sampai. Permintaan, bukan keadaan dokumen. */
  tanggal_kirim: string | null;
  perihal: string | null;
  attn: string | null;
  subtotal: number;
  diskon_persen: number;
  diskon_nominal: number;
  dpp: number;
  ppn_persen: number;
  ppn_nominal: number;
  pph_persen: number;
  /** "item" = hanya item yang dicentang; "total" = seluruh DPP. */
  pph_dasar: "item" | "total";
  pph_nominal: number;
  total: number;
  currency: QuotationCurrency;
  syarat_pembayaran: string | null;
  catatan: string | null;
  nama_pembuat: string | null;
  /** Penanda tangan yang dipilih. Null = ruang kosong + nama pembuat di PDF. */
  ttd: TtdDokumenProps | null;
  created_at: string | null;
  customer: {
    id: number;
    kode: string | null;
    nama_customer: string | null;
    alamat: string | null;
  };
  item?: PoKeluarItemProps[];
};
