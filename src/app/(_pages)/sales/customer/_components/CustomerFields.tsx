"use client";

import Textarea from "@/components/Textarea";
import { useState } from "react";
import { CustomerFormProps, generateKodeCustomer } from "../_libs/action";
import { ErrorForm } from "../_libs/skema";

/**
 * Isi form customer, dipakai bersama oleh Create dan Edit.
 *
 * Fitur lain di repo ini menyalin seluruh form ke dua berkas. Di sini tidak:
 * formnya sembilan field dan keduanya identik, jadi menyalinnya berarti setiap
 * penambahan field harus diingat dua kali — dan yang terlupa baru ketahuan saat
 * data tersimpan kosong.
 *
 * ## Kode customer
 *
 * Dikunci sampai nama diisi, lalu diusulkan backend lewat tombol GENERATE dan
 * SETELAH itu boleh disunting. Alasannya: kode ikut terbaca orang di daftar dan
 * di dokumen, jadi usulan otomatis saja tidak cukup — kadang perusahaan sudah
 * punya kode sendiri untuk customer itu. Yang dihindari cuma field kosong yang
 * diisi ngawur karena user belum tahu formatnya.
 */
type Props = {
  formData: CustomerFormProps;
  setFormData: (data: CustomerFormProps) => void;
  error?: ErrorForm;
  /** Edit: kode sudah ada, jadi tidak pernah terkunci. */
  kodeTerbuka?: boolean;
};

export default function CustomerFields({
  formData,
  setFormData,
  error,
  kodeTerbuka = false,
}: Props) {
  const [kodeDibuka, setKodeDibuka] = useState(kodeTerbuka);
  const [isLoadingKode, setIsLoadingKode] = useState(false);
  const [gagalKode, setGagalKode] = useState("");

  const ubah = (field: keyof CustomerFormProps, nilai: string) =>
    setFormData({ ...formData, [field]: nilai });

  const namaSiap = formData.nama_customer.trim().length >= 3;

  const handleGenerate = async () => {
    setIsLoadingKode(true);
    setGagalKode("");
    try {
      const hasil = await generateKodeCustomer(formData.nama_customer.trim());
      if (hasil.status && hasil.kode) {
        setFormData({ ...formData, kode: hasil.kode });
        setKodeDibuka(true);
      } else {
        setGagalKode(hasil.message || "Gagal membuat kode");
      }
    } catch {
      setGagalKode("Gagal membuat kode, coba lagi");
    } finally {
      setIsLoadingKode(false);
    }
  };

  /** Kelas + pesan error di bawah field, mengikuti validasi Bootstrap. */
  const kelas = (field: keyof CustomerFormProps, dasar = "form-control") =>
    `${dasar}${error?.[field] ? " is-invalid" : ""}`;

  const pesan = (field: keyof CustomerFormProps) =>
    error?.[field] ? (
      <div className="invalid-feedback d-block">{error[field]}</div>
    ) : null;

  return (
    <>
      <div className="row">
        <div className="col-md-8">
          <div className="form-group mb-3">
            <label htmlFor="nama_customer" className="form-label">
              NAMA CUSTOMER
            </label>
            <input
              id="nama_customer"
              type="text"
              // Sengaja tanpa text-uppercase: nama customer dipakai apa adanya,
              // termasuk untuk surat penawaran. Kode di sebelahnya lain cerita.
              className={kelas("nama_customer")}
              value={formData.nama_customer}
              onChange={(e) => ubah("nama_customer", e.target.value)}
            />
            {pesan("nama_customer")}
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group mb-3">
            <label htmlFor="kode" className="form-label">
              KODE
            </label>
            <div className="input-group">
              <input
                id="kode"
                type="text"
                className={kelas("kode") + " text-uppercase"}
                placeholder={kodeDibuka ? "" : "Isi nama dulu"}
                value={formData.kode}
                onChange={(e) => ubah("kode", e.target.value)}
                disabled={!kodeDibuka}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                title={
                  namaSiap
                    ? "Buat kode dari nama customer"
                    : "Isi nama customer minimal 3 karakter"
                }
                disabled={!namaSiap || isLoadingKode}
                onClick={handleGenerate}
              >
                {isLoadingKode ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <i className="fas fa-magic" />
                )}
              </button>
            </div>
            {pesan("kode")}
            {gagalKode && (
              <div className="invalid-feedback d-block">{gagalKode}</div>
            )}
            {kodeDibuka && !error?.kode && !gagalKode && (
              <small className="text-muted">
                Boleh diubah kalau tidak sesuai.
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="alamat" className="form-label">
          ALAMAT
        </label>
        <Textarea
          id="alamat"
          className={error?.alamat ? "is-invalid" : ""}
          value={formData.alamat}
          onChange={(e) => ubah("alamat", e.target.value)}
        />
        {pesan("alamat")}
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="telp" className="form-label">
              TELP
            </label>
            <input
              id="telp"
              type="text"
              className={kelas("telp")}
              value={formData.telp}
              onChange={(e) => ubah("telp", e.target.value)}
            />
            {pesan("telp")}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              EMAIL
            </label>
            <input
              id="email"
              type="text"
              className={kelas("email")}
              value={formData.email}
              onChange={(e) => ubah("email", e.target.value)}
            />
            {pesan("email")}
          </div>
        </div>
      </div>
    </>
  );
}
