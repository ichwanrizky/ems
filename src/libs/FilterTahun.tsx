import React from "react";

/**
 * Isi `<select>` filter tahun.
 *
 * ## Dua mode, dan pilih yang benar
 *
 * - **Tanpa prop** (`<FilterTahun />`) — tiga tahun terakhir dengan lantai 2024,
 *   dihitung dari kalender. Dipakai modul HR dan Finance, yang datanya memang
 *   baru dimulai 2024 dan tumbuh mengikuti tahun berjalan.
 *
 * - **Dengan `daftar`** (`<FilterTahun daftar={tahun} semua />`) — pilihannya
 *   diambil dari tahun yang BENAR-BENAR ada datanya, hasil
 *   `GET /api/sales/{modul}/tahun`. Wajib dipakai modul yang isinya memuat data
 *   impor.
 *
 * ## Kenapa mode kedua ada
 *
 * Mode pertama menebak rentang data dari kalender, dan tebakan itu berhenti
 * benar begitu data impor masuk. Yang terjadi di modul Sales:
 *
 * - 84 PO masuk seluruhnya bertanggal 2019–2020. Dengan pilihan yang berhenti di
 *   2024, halamannya SELALU kosong dan tidak ada satu pun pilihan yang bisa
 *   menampilkannya — datanya bukan tersembunyi, melainkan tidak terjangkau.
 * - 2.845 quotation (2019–2023) terkena hal yang sama sejak impornya, dan tidak
 *   ada yang menyadarinya karena halamannya tetap menampilkan ratusan baris
 *   tahun berjalan sehingga tidak pernah terlihat "kosong".
 *
 * Lantai yang dipatok di kode akan salah lagi suatu hari. Yang menentukan
 * rentangnya isi tabel, jadi tabelnya yang ditanya.
 */
type Props = {
  /** Tahun yang ada datanya, dari backend. Kosong = pakai mode kalender. */
  daftar?: number[];
  /** Tambahkan pilihan "SEMUA TAHUN" (value `""`) di puncak daftar. */
  semua?: boolean;
};

export const FilterTahun = ({ daftar, semua }: Props = {}) => {
  if (daftar && daftar.length > 0) {
    return (
      <>
        {semua && <option value="">SEMUA TAHUN</option>}
        {daftar.map((tahun) => (
          <option value={tahun} key={tahun}>
            {tahun}
          </option>
        ))}
      </>
    );
  }

  // Daftar belum sampai (masih dimuat) tapi "semua" diminta: satu pilihan itu
  // saja sudah cukup untuk menampilkan seluruh data, jadi halamannya tidak
  // pernah kosong hanya karena daftar tahunnya belum tiba.
  if (semua) {
    return <option value="">SEMUA TAHUN</option>;
  }

  return Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year >= 2024 ? (
      <option value={year} key={i}>
        {year}
      </option>
    ) : null;
  });
};
