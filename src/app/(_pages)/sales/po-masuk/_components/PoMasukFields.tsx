"use client";

import Textarea from "@/components/Textarea";
import { uang } from "@/libs/Dokumen";
import {
  CustomerProps,
  QuotationCurrency,
  QuotationPilihanProps,
} from "@/types";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import Select from "react-select";
import {
  getCustomerPilihan,
  getQuotationPilihan,
  PoMasukFormProps,
  unggahBerkasPo,
} from "../_libs/action";
import {
  ErrorForm,
  ikonBerkas,
  MAKS_BERKAS,
  tautanBerkas,
  ukuranBerkas,
} from "../_libs/skema";

/**
 * Isi form PO Masuk, dipakai bersama oleh Create dan Edit.
 *
 * Tetap MODAL, bukan halaman penuh seperti form quotation: formnya delapan
 * field tanpa tabel item, jadi tidak ada yang memaksa dua scrollbar bersarang.
 * Yang panjang di modul ini bukan formnya, melainkan daftarnya.
 *
 * ## Quotation menyusul customer
 *
 * Dropdown penawaran baru terisi setelah customer dipilih, dan isinya cuma
 * penawaran milik customer itu. Ada 5.000-an penawaran di tabelnya — dropdown
 * yang memuat semuanya bukan bantuan, melainkan daftar yang harus disaring
 * sendiri oleh user.
 *
 * Mengganti customer MENGOSONGKAN pilihan penawaran, bukan membiarkannya. Kalau
 * dibiarkan, PO akan tersimpan menunjuk penawaran pihak lain — backend menolak
 * dengan 409, tapi user baru tahu setelah menekan simpan dan tidak diberi tahu
 * field mana yang salah.
 *
 * ## Berkas
 *
 * Diunggah SEKARANG, bukan saat submit: barisnya lahir "yatim" di backend lalu
 * diklaim saat disimpan. Itu satu-satunya cara form create bisa punya berkas —
 * ia belum punya id apa pun — dan sekaligus menghindari PUT multipart, yang
 * tidak di-parse PHP sama sekali.
 */
type Props = {
  formData: PoMasukFormProps;
  /**
   * Setter state, BUKAN `(data) => void` seperti `CustomerFields`.
   *
   * Unggah berkas berjalan asinkron dan bisa memakan belasan detik untuk enam
   * berkas. Selama itu user masih mengetik di field lain, jadi `formData` yang
   * tertangkap closure sudah basi saat unggahannya selesai — menyimpannya
   * dengan objek utuh akan mengembalikan isian ke keadaan sebelum diketik.
   * Bentuk fungsi (`s => ...`) selalu membaca state terkini.
   */
  setFormData: React.Dispatch<React.SetStateAction<PoMasukFormProps>>;
  error?: ErrorForm;
};

export default function PoMasukFields({ formData, setFormData, error }: Props) {
  const [customerData, setCustomerData] = useState([] as CustomerProps[]);
  const [quotationData, setQuotationData] = useState(
    [] as QuotationPilihanProps[],
  );
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
  const [isUnggah, setIsUnggah] = useState(false);
  const [gagalUnggah, setGagalUnggah] = useState("");

  useEffect(() => {
    const ambil = async () => {
      const hasil = await getCustomerPilihan();
      if (hasil.status) setCustomerData(hasil.data);
    };

    ambil();
  }, []);

  // Penawaran dimuat ulang setiap kali customernya berganti — termasuk sekali
  // di awal mode edit, yang customernya sudah terisi sejak render pertama.
  useEffect(() => {
    if (!formData.customer_id) {
      setQuotationData([]);
      return;
    }

    let batal = false;

    const ambil = async () => {
      setIsLoadingQuotation(true);
      try {
        const hasil = await getQuotationPilihan(formData.customer_id);
        if (!batal && hasil.status) setQuotationData(hasil.data);
      } finally {
        if (!batal) setIsLoadingQuotation(false);
      }
    };

    ambil();

    return () => {
      batal = true;
    };
  }, [formData.customer_id]);

  const handleUnggah = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUnggah(true);
    setGagalUnggah("");

    // Batas dihitung dari daftar yang tumbuh di dalam loop, bukan dari
    // `formData` yang baru menyusul lewat render berikutnya — kalau tidak,
    // memilih sepuluh berkas sekaligus akan mengunggah kesepuluhnya sebelum
    // batasnya sempat terbaca sekali pun.
    let terpasang = formData.berkas?.length ?? 0;

    try {
      // Berurutan, bukan Promise.all: berkas PO bisa 15 MB, dan mengirim enam
      // sekaligus membuat server action memegang semuanya di memori pada saat
      // yang sama.
      for (const file of Array.from(files)) {
        if (terpasang >= MAKS_BERKAS) break;

        const form = new FormData();
        form.append("berkas", file);

        const hasil = await unggahBerkasPo(form);

        if (!hasil.status || !hasil.berkas) {
          setGagalUnggah(hasil.message);
          break;
        }

        const berkas = hasil.berkas;
        terpasang += 1;

        // Bentuk fungsi, bukan objek utuh: user bisa mengetik field lain selama
        // unggahan berjalan, dan `formData` yang tertangkap closure sudah basi.
        setFormData((s) => ({ ...s, berkas: [...(s.berkas ?? []), berkas] }));
      }
    } finally {
      setIsUnggah(false);
    }
  };

  const hapusBerkas = (uuid: string) =>
    setFormData((s) => ({
      ...s,
      berkas: (s.berkas ?? []).filter((b) => b.uuid !== uuid),
    }));

  const ubah = (field: keyof PoMasukFormProps, nilai: unknown) =>
    setFormData((s) => ({ ...s, [field]: nilai }) as PoMasukFormProps);

  const opsiCustomer = customerData.map((c) => ({
    value: c.id,
    label: `${c.kode} — ${c.nama_customer}`,
  }));

  const opsiQuotation = quotationData.map((q) => ({
    value: q.id,
    label: `${q.nomor} — ${q.perihal ?? ""}`.trim(),
  }));

  /** Kelas + pesan error di bawah field, mengikuti validasi Bootstrap. */
  const kelas = (field: keyof PoMasukFormProps, dasar = "form-control") =>
    `${dasar}${error?.[field as keyof ErrorForm] ? " is-invalid" : ""}`;

  const pesan = (field: keyof PoMasukFormProps) =>
    error?.[field as keyof ErrorForm] ? (
      <div className="invalid-feedback d-block">
        {error[field as keyof ErrorForm]}
      </div>
    ) : null;

  const jumlahBerkas = formData.berkas?.length ?? 0;
  const penuh = jumlahBerkas >= MAKS_BERKAS;

  return (
    <>
      <div className="row">
        <div className="col-md-5">
          <div className="form-group mb-3">
            <label htmlFor="nomor" className="form-label">
              NOMOR PO
            </label>
            <input
              id="nomor"
              type="text"
              className={kelas("nomor")}
              placeholder="Nomor dari customer, mis. 2203674020"
              value={formData.nomor}
              onChange={(e) => ubah("nomor", e.target.value)}
            />
            {pesan("nomor") ?? (
              <small className="text-muted">
                Salin apa adanya dari dokumen customer.
              </small>
            )}
          </div>
        </div>

        <div className="col-md-3">
          <div className="form-group mb-3">
            <label htmlFor="tanggal" className="form-label">
              TANGGAL PO
            </label>
            <input
              id="tanggal"
              type="date"
              className={kelas("tanggal")}
              value={formData.tanggal}
              onChange={(e) => ubah("tanggal", e.target.value)}
            />
            {pesan("tanggal")}
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group mb-3">
            <label htmlFor="requestor" className="form-label">
              REQUESTOR
            </label>
            <input
              id="requestor"
              type="text"
              className={kelas("requestor")}
              placeholder="Nama peminta di pihak customer"
              value={formData.requestor}
              onChange={(e) => ubah("requestor", e.target.value)}
            />
            {pesan("requestor")}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label className="form-label">CUSTOMER</label>
            <Select
              instanceId="po-masuk-customer"
              placeholder="Select Customer"
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : undefined
              }
              styles={{
                option: (s) => ({ ...s, color: "black" }),
                menuPortal: (s) => ({ ...s, zIndex: 9999 }),
                // `is-invalid` tidak menyentuh react-select: yang digambar ke
                // layar div bikinannya sendiri, bukan elemen yang memegang
                // kelas itu.
                control: (s) => ({
                  ...s,
                  borderColor: error?.customer_id ? "#dc3545" : s.borderColor,
                }),
              }}
              options={opsiCustomer}
              onChange={(e: any) =>
                // Penawarannya ikut dikosongkan: yang terpilih tadi milik
                // customer lama, dan membiarkannya membuat PO tersimpan
                // menunjuk penawaran pihak lain.
                setFormData((s) => ({
                  ...s,
                  customer_id: e?.value ?? "",
                  quotation_id: null,
                }))
              }
              value={
                formData.customer_id
                  ? opsiCustomer.find((o) => o.value === formData.customer_id)
                  : null
              }
              isClearable
            />
            {pesan("customer_id")}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group mb-3">
            <label className="form-label">
              QUOTATION{" "}
              <span className="text-muted fw-normal">(opsional)</span>
            </label>
            <Select
              instanceId="po-masuk-quotation"
              placeholder={
                !formData.customer_id
                  ? "Pilih customer dulu"
                  : isLoadingQuotation
                    ? "Memuat ..."
                    : opsiQuotation.length === 0
                      ? "Customer ini belum punya penawaran"
                      : "Select Quotation"
              }
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : undefined
              }
              styles={{
                option: (s) => ({ ...s, color: "black" }),
                menuPortal: (s) => ({ ...s, zIndex: 9999 }),
                control: (s) => ({
                  ...s,
                  borderColor: error?.quotation_id ? "#dc3545" : s.borderColor,
                }),
              }}
              options={opsiQuotation}
              isDisabled={!formData.customer_id || isLoadingQuotation}
              onChange={(e: any) => ubah("quotation_id", e?.value ?? null)}
              value={
                formData.quotation_id
                  ? (opsiQuotation.find(
                      (o) => o.value === formData.quotation_id,
                    ) ?? null)
                  : null
              }
              isClearable
            />
            {pesan("quotation_id") ?? (
              <small className="text-muted">
                Kosongkan bila PO datang tanpa penawaran.
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="perihal" className="form-label">
              PERIHAL
            </label>
            <input
              id="perihal"
              type="text"
              className={kelas("perihal")}
              placeholder="Isi singkat PO-nya"
              value={formData.perihal}
              onChange={(e) => ubah("perihal", e.target.value)}
            />
            {pesan("perihal")}
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group mb-3">
            <label htmlFor="nilai" className="form-label">
              NILAI PO
            </label>
            <NumericFormat
              id="nilai"
              className={kelas("nilai", "form-control text-end")}
              thousandSeparator=","
              decimalScale={2}
              allowNegative={false}
              placeholder="Kosongkan bila tidak tercantum"
              value={formData.nilai}
              // `?? ""` — bukan `?? 0`. "Tanpa nilai" dan "senilai nol" dua hal
              // berbeda, dan mengubah yang pertama jadi nol membuat daftarnya
              // memuat baris "Rp 0" untuk PO yang nominalnya memang tidak
              // tercantum.
              onValueChange={(v) => ubah("nilai", v.floatValue ?? "")}
              onWheel={(e: any) => e.target.blur()}
            />
            {pesan("nilai")}
          </div>
        </div>

        <div className="col-md-2">
          <div className="form-group mb-3">
            <label htmlFor="currency" className="form-label">
              MATA UANG
            </label>
            <select
              id="currency"
              className={kelas("currency", "form-control")}
              value={formData.currency}
              onChange={(e) =>
                ubah("currency", e.target.value as QuotationCurrency)
              }
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="SGD">SGD</option>
            </select>
            {pesan("currency")}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------
          BERKAS — inti modul ini.

          Ditaruh menonjol, bukan sebagai baris terakhir yang mudah
          terlewat: PO masuk yang tersimpan tanpa berkas adalah catatan
          tentang dokumen yang tidak ada di sini.
      -------------------------------------------------------------- */}
      <div className="form-group mb-3">
        <label className="form-label">
          BERKAS PO{" "}
          <span className="text-muted fw-normal">
            ({jumlahBerkas}/{MAKS_BERKAS})
          </span>
        </label>

        <div className="border rounded p-2">
          {jumlahBerkas > 0 ? (
            <ul className="list-unstyled mb-2">
              {(formData.berkas ?? []).map((b) => (
                <li
                  key={b.uuid}
                  className="d-flex align-items-center gap-2 py-1"
                >
                  <i className={ikonBerkas(b.tipe)} />
                  <a
                    href={tautanBerkas(b.uuid)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-truncate"
                    style={{ maxWidth: "24rem" }}
                    title={b.nama_asli}
                  >
                    {b.nama_asli}
                  </a>
                  <span className="text-muted fs-6">
                    {ukuranBerkas(b.ukuran)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-light btn-xs sharp text-danger ms-auto"
                    title="Buang berkas ini"
                    onClick={() => hapusBerkas(b.uuid)}
                  >
                    <i className="fa fa-times" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted fs-6 mb-2">Belum ada berkas.</p>
          )}

          <label
            className={`btn btn-outline-primary btn-sm mb-0${
              penuh || isUnggah ? " disabled" : ""
            }`}
            title={
              penuh
                ? `Maksimal ${MAKS_BERKAS} berkas`
                : "PDF, gambar, Word, atau Excel — maksimal 15 MB per berkas"
            }
          >
            {isUnggah ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Mengunggah ...
              </>
            ) : (
              <>
                <i className="fas fa-upload me-2" />
                {penuh ? `Maksimal ${MAKS_BERKAS} berkas` : "Tambah berkas"}
              </>
            )}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,.doc,.docx,.xls,.xlsx"
              multiple
              hidden
              disabled={penuh || isUnggah}
              onChange={(e) => {
                handleUnggah(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {pesan("berkas")}
        {gagalUnggah && (
          <div className="invalid-feedback d-block">{gagalUnggah}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="catatan" className="form-label">
          CATATAN
        </label>
        <Textarea
          id="catatan"
          className={error?.catatan ? "is-invalid" : ""}
          value={formData.catatan}
          onChange={(e) => ubah("catatan", e.target.value)}
        />
        {pesan("catatan")}
      </div>

      {/* Pratinjau nilai dalam mata uangnya, supaya salah pilih mata uang
          ketahuan di sini — bukan setelah PO-nya masuk daftar dan "USD 15.000"
          terbaca sebagai rupiah. */}
      {formData.nilai !== "" && (
        <p className="text-muted fs-6 mb-0">
          Nilai PO: <strong>{uang(Number(formData.nilai), formData.currency)}</strong>
        </p>
      )}
    </>
  );
}
