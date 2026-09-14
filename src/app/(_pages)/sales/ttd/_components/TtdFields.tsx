"use client";

import TtdPad from "@/components/TtdPad";
import { TtdFormProps } from "../_libs/action";
import { ErrorForm } from "../_libs/skema";

/**
 * Isi form tanda tangan, dipakai bersama oleh Create dan Edit.
 *
 * Formnya cuma tiga hal dan keduanya identik, jadi menyalinnya ke dua berkas
 * berarti setiap perubahan harus diingat dua kali — dan yang terlupa baru
 * ketahuan saat data tersimpan kosong.
 *
 * Gambarnya TIDAK ikut `formData`: ia Blob, bukan string, dan diunggah lebih
 * dulu ke backend sebagai request tersendiri. Yang naik ke atas lewat
 * `onGambar` cuma blob terakhir; pengunggahannya urusan modal yang memanggil.
 */
type Props = {
  formData: Omit<TtdFormProps, "gambar_uuid">;
  setFormData: (data: Omit<TtdFormProps, "gambar_uuid">) => void;
  onGambar: (blob: Blob | null) => void;
  /** Edit: URL gambar tersimpan, ditampilkan sampai orang menggantinya. */
  gambarAwal?: string | null;
  error?: ErrorForm;
};

export default function TtdFields({
  formData,
  setFormData,
  onGambar,
  gambarAwal = null,
  error,
}: Props) {
  const ubah = (field: keyof Omit<TtdFormProps, "gambar_uuid">, nilai: string) =>
    setFormData({ ...formData, [field]: nilai });

  /** Kelas + pesan error di bawah field, mengikuti validasi Bootstrap. */
  const kelas = (field: keyof ErrorForm, dasar = "form-control") =>
    `${dasar}${error?.[field] ? " is-invalid" : ""}`;

  const pesan = (field: keyof ErrorForm) =>
    error?.[field] ? (
      <div className="invalid-feedback d-block">{error[field]}</div>
    ) : null;

  return (
    <>
      <div className="row">
        <div className="col-md-7">
          <div className="form-group mb-3">
            <label htmlFor="nama" className="form-label">
              NAMA
            </label>
            <input
              id="nama"
              type="text"
              // Sengaja tanpa text-uppercase: ini nama diri dan tercetak apa
              // adanya di bawah garis tanda tangan pada surat penawaran.
              className={kelas("nama")}
              value={formData.nama}
              onChange={(e) => ubah("nama", e.target.value)}
            />
            {pesan("nama")}
          </div>
        </div>

        <div className="col-md-5">
          <div className="form-group mb-3">
            <label htmlFor="jabatan" className="form-label">
              JABATAN
            </label>
            <input
              id="jabatan"
              type="text"
              className={kelas("jabatan")}
              placeholder="Boleh dikosongkan"
              value={formData.jabatan}
              onChange={(e) => ubah("jabatan", e.target.value)}
            />
            {pesan("jabatan")}
          </div>
        </div>
      </div>

      <TtdPad onChange={onGambar} awal={gambarAwal} error={error?.gambar} />
    </>
  );
}
