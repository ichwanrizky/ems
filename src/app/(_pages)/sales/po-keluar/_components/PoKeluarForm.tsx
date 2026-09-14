"use client";

import Alert from "@/components/Alert";
import Textarea from "@/components/Textarea";
import {
  PoKeluarItemProps,
  PoKeluarProps,
  QuotationCurrency,
  CustomerProps,
  TtdProps,
} from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import Select from "react-select";
import {
  createPoKeluar,
  editPoKeluar,
  getCustomerPilihan,
  getTtdPilihan,
  PoKeluarFormProps,
} from "../_libs/action";
import {
  ErrorForm,
  kunciItem,
  ringkasError,
  uang,
  validasiPoKeluar,
} from "../_libs/skema";

/**
 * Form PO keluar — halaman penuh, dipakai `create/page.tsx` dan `edit/page.tsx`.
 *
 * Bukan modal seperti form PO masuk di sebelah: satu PO bisa berisi puluhan
 * baris item, dan tabel sepanjang itu di dalam modal memaksa dua scrollbar
 * bersarang. Polanya mengikuti `sales/quotation/_components/QuotationForm`.
 *
 * ## Susunan layar
 *
 * Empat bagian bernomor: (1) informasi PO, (2) item, (3) syarat & catatan,
 * (4) nilai. Urutannya sengaja sama dengan urutan membaca PO yang jadi, supaya
 * isian dan hasilnya bisa dicocokkan sambil jalan — dan sama pula dengan form
 * quotation, supaya orang yang sudah terbiasa di sana tidak perlu belajar ulang.
 *
 * ## Tidak ada grup, dan itu disengaja
 *
 * Quotation punya grup karena ia kadang menawarkan pilihan paket ("Opsi A" /
 * "Opsi B") yang tidak boleh dijumlahkan. PO tidak pernah menawarkan pilihan —
 * ia perintah beli, dan semua barisnya dibeli. Jadi di sini itemnya satu daftar
 * datar, dan grand totalnya selalu ada.
 *
 * Yang menggantikan kebutuhan memisah bagian: baris JUDUL, yang boleh
 * berkali-kali dan tidak ikut dihitung.
 *
 * ## Angka
 *
 * Yang tampil di sini PRATINJAU. Yang tersimpan dihitung ulang backend dari
 * item; rumusnya digandakan di sini hanya supaya user melihat totalnya berubah
 * saat mengetik. Kalau rumusnya berubah, backend yang jadi acuan.
 *
 * ## Validasi
 *
 * Lewat zod (`_libs/skema.ts`), BUKAN atribut `required` — validasi native
 * menyela submit lebih dulu, dan pesannya tidak bisa diseragamkan. Error item
 * dikunci path (`item.2.qty`) jadi pesannya menempel di sel yang benar;
 * ringkasannya ikut naik ke alert atas form karena tabel itemnya bisa sepanjang
 * layar.
 */
type Props = {
  /** Kosong = mode create. */
  poEdit?: PoKeluarProps | null;
};

const ITEM_KOSONG = (): PoKeluarItemProps => ({
  judul: false,
  deskripsi: "",
  satuan: "",
  qty: 1,
  harga: 0,
  diskon_persen: 0,
  kena_pph: false,
  remarks: "",
});

const angka = (nilai: number | string): number => {
  const n = typeof nilai === "number" ? nilai : parseFloat(String(nilai));
  return Number.isFinite(n) ? n : 0;
};

/** Tanggal hari ini sebagai "YYYY-MM-DD" memakai komponen LOKAL (WIB). */
const hariIni = () => {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
};

export default function PoKeluarForm({ poEdit }: Props) {
  const mode = poEdit ? "edit" : "create";
  const { push } = useRouter();

  /**
   * Alamat daftar yang harus dituju setelah selesai — lengkap dengan halaman
   * asalnya. Tanpa ini, menyunting baris di halaman 4 selalu memulangkan user
   * ke halaman 1.
   */
  const halaman = Number(useSearchParams().get("page"));
  const kembaliKeDaftar =
    Number.isInteger(halaman) && halaman > 1
      ? `/sales/po-keluar?page=${halaman}`
      : "/sales/po-keluar";

  /**
   * Titipkan hasil simpan untuk ditampilkan halaman daftar.
   *
   * Banner di form ini sendiri praktis tidak pernah terbaca: tombol simpan ada
   * di dasar form yang panjang sementara banner-nya di puncak, jadi user sudah
   * berpindah halaman sebelum sempat menggulir ke atas. Yang gagal tetap
   * ditampilkan DI SINI — form-nya tidak ditinggalkan, dan pesannya menempel
   * pada isian yang perlu diperbaiki.
   */
  const titipHasil = (subMessage: string) => {
    try {
      sessionStorage.setItem(
        "po-keluar:hasil",
        JSON.stringify({ color: "success", message: "Success", subMessage }),
      );
    } catch {
      // Private window / cookie diblokir. Banner yang hilang bukan alasan untuk
      // menggagalkan penyimpanan yang sudah berhasil.
    }
  };

  const [alert, setAlert] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [customerData, setCustomerData] = useState([] as CustomerProps[]);
  const [ttdData, setTtdData] = useState([] as TtdProps[]);
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  const [formData, setFormData] = useState<PoKeluarFormProps>({
    customer_id: poEdit?.customer.id ?? "",
    revisi: poEdit?.revisi ?? 0,
    tanggal: poEdit?.tanggal ?? hariIni(),
    tanggal_kirim: poEdit?.tanggal_kirim ?? "",
    attn: poEdit?.attn ?? "",
    perihal: poEdit?.perihal ?? "",
    syarat_pembayaran: poEdit?.syarat_pembayaran ?? "",
    catatan: poEdit?.catatan ?? "",
    diskon_persen: poEdit?.diskon_persen ?? 0,
    // PPN default NOL, bukan 11 — sama seperti di form quotation.
    //
    // Tarif yang terisi sendiri di form baru adalah tarif yang ikut tercetak
    // tanpa pernah diputuskan siapa pun, dan PO yang salah memungut pajak jauh
    // lebih mahal ongkosnya daripada mengetik satu angka.
    ppn_persen: poEdit?.ppn_persen ?? 0,
    // PPh default nol juga: tidak semua pembelian kena PPh 23 — barang tidak,
    // jasa iya. Sistem lama menyediakan pilihan "Service: Yes/No" yang dipatok
    // 2%; di sini tarifnya diketik, karena PPh 23 punya tarif lain untuk objek
    // lain dan supplier tanpa NPWP dikenakan dua kali lipat.
    pph_persen: poEdit?.pph_persen ?? 0,
    pph_dasar: poEdit?.pph_dasar ?? "item",
    currency: poEdit?.currency ?? "IDR",
    // Tanpa default: tanda tangan yang terpilih sendiri adalah tanda tangan
    // yang ikut tercetak tanpa pernah diputuskan siapa pun.
    ttd_id: poEdit?.ttd?.id ?? "",
    item:
      poEdit?.item && poEdit.item.length > 0
        ? poEdit.item.map((i) => ({ ...i }))
        : [ITEM_KOSONG()],
  });

  useEffect(() => {
    const ambil = async () => {
      setIsLoadingPage(true);
      try {
        // Berbarengan, bukan berurutan: keduanya request mandiri, dan
        // menunggunya satu per satu menambah waktu buka form tanpa alasan.
        const [result, ttd] = await Promise.all([
          getCustomerPilihan(),
          getTtdPilihan(),
        ]);

        if (result.status) {
          setCustomerData(result.data);
        } else {
          setAlert({
            status: true,
            color: "danger",
            message: "Failed",
            subMessage: result.message,
          });
        }

        // Daftar tanda tangan yang gagal dimuat TIDAK menghentikan form: tanda
        // tangan opsional, dan PO masih bisa disimpan tanpa itu. Yang terjadi
        // cuma dropdownnya kosong.
        if (ttd.status) {
          setTtdData(ttd.data);
        }
      } catch (error) {
        setAlert({
          status: true,
          color: "danger",
          message: "Error",
          subMessage: "Something went wrong, please refresh and try again",
        });
      } finally {
        setIsLoadingPage(false);
      }
    };

    ambil();
  }, []);

  // ---------------------------------------------------------------- item
  const ubahItem = (
    ii: number,
    field: keyof PoKeluarItemProps,
    nilai: unknown,
  ) =>
    setFormData((s) => ({
      ...s,
      item: s.item.map((it, j) => (j === ii ? { ...it, [field]: nilai } : it)),
    }));

  const tambahItem = () =>
    setFormData((s) => ({ ...s, item: [...s.item, ITEM_KOSONG()] }));

  const hapusItem = (ii: number) =>
    setFormData((s) => ({
      ...s,
      // Backend menolak PO tanpa item, jadi baris terakhir dikosongkan isinya —
      // bukan dihapus — supaya usernya tidak terjebak form tanpa baris.
      item:
        s.item.length === 1
          ? [ITEM_KOSONG()]
          : s.item.filter((_, j) => j !== ii),
    }));

  // -------------------------------------------------------------- hitung
  // Baris judul tidak pernah menyumbang nilai — sama seperti di
  // PoKeluarController::hitung(), yang jadi acuannya.
  const jumlahBaris = (b: PoKeluarItemProps) => {
    if (b.judul) return 0;
    const kotor = angka(b.qty) * angka(b.harga);
    return kotor - (kotor * angka(b.diskon_persen)) / 100;
  };

  const subtotal = formData.item.reduce((t, b) => t + jumlahBaris(b), 0);

  const diskonPersen = angka(formData.diskon_persen);
  const ppnPersen = angka(formData.ppn_persen);
  const pphPersen = angka(formData.pph_persen);

  const diskonNominal = (subtotal * diskonPersen) / 100;
  const dpp = subtotal - diskonNominal;
  const ppnNominal = (dpp * ppnPersen) / 100;

  const dasarItem = formData.item
    .filter((b) => b.kena_pph)
    .reduce((t, b) => t + jumlahBaris(b), 0);

  // Dasar PPh "item" ikut diskalakan diskon header — sama seperti di backend.
  const dasarPph =
    formData.pph_dasar === "total"
      ? dpp
      : subtotal > 0
        ? dasarItem * (dpp / subtotal)
        : 0;

  const pphNominal = (dasarPph * pphPersen) / 100;
  const total = dpp + ppnNominal - pphNominal;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Divalidasi di sini dulu supaya salah ketik tidak perlu perjalanan ke
    // server. Server action menjalankan skema yang SAMA lagi — ini percepatan,
    // bukan gerbangnya.
    const periksa = validasiPoKeluar(formData);

    if (!periksa.sukses) {
      setErrorForm(periksa.error);
      setAlert({
        status: true,
        color: "danger",
        message: "Periksa kembali isian form",
        subMessage: ringkasError(periksa.error),
      });
      // Alertnya di atas card, jadi tanpa ini user yang sedang berada di baris
      // item ke-40 tidak melihat apa pun terjadi setelah menekan simpan.
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrorForm({});

    if (!confirm("Submit this data?")) return;

    setIsLoadingSubmit(true);
    try {
      const result =
        mode === "edit"
          ? await editPoKeluar({ ...formData, id: poEdit!.id })
          : await createPoKeluar(formData);

      if (result.status) {
        titipHasil(result.message);
        push(kembaliKeDaftar);
      } else {
        if (result.error) setErrorForm(result.error);
        setAlert({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
        setIsLoadingSubmit(false);
      }
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
      setIsLoadingSubmit(false);
    }
  };

  const opsiCustomer = customerData.map((s) => ({
    value: s.id,
    label: `${s.kode} — ${s.nama_customer}`,
  }));

  /** Centang per item tidak berlaku kalau PPh dikenakan atas seluruh nilai. */
  const pphPerItem = formData.pph_dasar === "item";

  /** Kelas + pesan error di bawah field, mengikuti validasi Bootstrap. */
  const kelas = (kunci: string, dasar = "form-control") =>
    `${dasar}${errorForm[kunci] ? " is-invalid" : ""}`;

  const pesan = (kunci: string) =>
    errorForm[kunci] ? (
      <div className="invalid-feedback d-block">{errorForm[kunci]}</div>
    ) : null;

  let nomorItem = 0;

  return (
    <div className="row">
      <div className="col-12">
        <form onSubmit={handleSubmit}>
          <div className="card">
            {alert.status && (
              <div className="px-3 mt-3">
                <Alert
                  color={alert.color}
                  message={alert.message}
                  subMessage={alert.subMessage}
                />
              </div>
            )}

            {isLoadingPage ? (
              <div className="d-flex justify-content-center p-3">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                LOADING ...
              </div>
            ) : (
              <>
                <div className="card-body">
                  {mode === "edit" && (
                    <div className="alert alert-info solid py-2 px-3">
                      Mengubah <strong>{poEdit?.nomor}</strong>.
                    </div>
                  )}

                  <h6 className="text-uppercase mb-3">1. Informasi PO</h6>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        {/* Labelnya SUPPLIER, datanya dari master Customer.
                            Bukan kekeliruan: PO Keluar mengambil lawan
                            transaksinya dari master yang sama dengan Quotation,
                            karena begitulah sistem lama bekerja dan begitu pula
                            datanya datang. Yang disebut di sini perannya pada
                            dokumen ini — kepada siapa PO ini ditujukan — bukan
                            nama tabelnya. */}
                        <label className="form-label">SUPPLIER</label>
                        <Select
                          instanceId="po-keluar-customer"
                          placeholder="Pilih dari daftar customer"
                          menuPortalTarget={
                            typeof document !== "undefined"
                              ? document.body
                              : undefined
                          }
                          styles={{
                            option: (s) => ({ ...s, color: "black" }),
                            menuPortal: (s) => ({ ...s, zIndex: 9999 }),
                            // `is-invalid` tidak menyentuh react-select: yang
                            // digambar ke layar div bikinannya sendiri, bukan
                            // elemen yang memegang kelas itu.
                            control: (s) => ({
                              ...s,
                              borderColor: errorForm.customer_id
                                ? "#dc3545"
                                : s.borderColor,
                            }),
                          }}
                          options={opsiCustomer}
                          onChange={(e: any) =>
                            setFormData((s) => ({
                              ...s,
                              customer_id: e?.value ?? "",
                            }))
                          }
                          value={
                            formData.customer_id
                              ? opsiCustomer.find(
                                  (o) => o.value === formData.customer_id,
                                )
                              : null
                          }
                          isClearable={mode !== "edit"}
                          isDisabled={mode === "edit"}
                        />
                        {pesan("customer_id") ??
                          (mode === "edit" ? (
                            <small className="text-muted">
                              Tidak bisa diganti — nomor PO sudah terbit atas
                              nama ini. Buat PO baru bila pemasoknya berbeda.
                            </small>
                          ) : (
                            <small className="text-muted">
                              Daftarnya sama dengan master Customer; belum ada?
                              tambahkan dulu di menu Customer.
                            </small>
                          ))}
                      </div>
                    </div>

                    <div className={mode === "edit" ? "col-md-4" : "col-md-6"}>
                      <div className="form-group mb-3">
                        <label htmlFor="attn" className="form-label">
                          ATTENTION
                        </label>
                        <input
                          id="attn"
                          type="text"
                          className={kelas("attn")}
                          placeholder="Nama kontak di supplier"
                          value={formData.attn}
                          onChange={(e) =>
                            setFormData((s) => ({ ...s, attn: e.target.value }))
                          }
                        />
                        {pesan("attn")}
                      </div>
                    </div>

                    {/* Revisi HANYA di mode edit. PO yang baru dibuat menurut
                        definisinya belum pernah direvisi, jadi menanyakannya di
                        form create cuma menawarkan isian yang satu-satunya
                        jawaban benarnya nol. */}
                    {mode === "edit" && (
                      <div className="col-md-2">
                        <div className="form-group mb-3">
                          <label htmlFor="revisi" className="form-label">
                            REVISI KE
                          </label>
                          <NumericFormat
                            id="revisi"
                            className={kelas("revisi", "form-control text-end")}
                            decimalScale={0}
                            allowNegative={false}
                            value={formData.revisi}
                            onValueChange={(v) =>
                              setFormData((s) => ({
                                ...s,
                                revisi: v.floatValue ?? 0,
                              }))
                            }
                            onWheel={(e: any) => e.target.blur()}
                          />
                          {pesan("revisi") ?? (
                            <small className="text-muted">
                              0 = bukan revisi
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="row">
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
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              tanggal: e.target.value,
                            }))
                          }
                        />
                        {pesan("tanggal")}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group mb-3">
                        <label htmlFor="tanggal_kirim" className="form-label">
                          TANGGAL KIRIM
                        </label>
                        <input
                          id="tanggal_kirim"
                          type="date"
                          className={kelas("tanggal_kirim")}
                          value={formData.tanggal_kirim}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              tanggal_kirim: e.target.value,
                            }))
                          }
                        />
                        {pesan("tanggal_kirim") ?? (
                          <small className="text-muted">
                            Boleh dikosongkan
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group mb-3">
                        <label htmlFor="perihal" className="form-label">
                          PERIHAL
                        </label>
                        <input
                          id="perihal"
                          type="text"
                          className={kelas("perihal")}
                          placeholder="Pengadaan material panel"
                          value={formData.perihal}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              perihal: e.target.value,
                            }))
                          }
                        />
                        {pesan("perihal")}
                      </div>
                    </div>

                    {/* Mata uang menentukan SIMBOL yang tercetak, bukan kurs:
                        harga diketik dalam mata uang ini dan tidak pernah
                        dikonversi. Dropdown, bukan isian bebas — nilainya jadi
                        awalan tiap nominal di PDF. */}
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
                            setFormData((s) => ({
                              ...s,
                              currency: e.target.value as QuotationCurrency,
                            }))
                          }
                        >
                          <option value="IDR">IDR — Rupiah</option>
                          <option value="USD">USD — Dolar AS</option>
                          <option value="SGD">SGD — Dolar Singapura</option>
                        </select>
                        {pesan("currency")}
                      </div>
                    </div>
                  </div>

                  {/* Tanda tangan dipilih dari master, bukan digambar di sini —
                      sama persis dengan form quotation, dan sengaja demikian:
                      dua dokumen yang blok tanda tangannya tercetak identik
                      sebaiknya juga diisi dengan cara yang identik.

                      Pratinjaunya ikut ditampilkan: nama di dropdown saja tidak
                      cukup untuk tahu bahwa yang terpilih benar-benar coretan
                      yang dimaksud, dan salah pilih baru ketahuan setelah PDF
                      sampai ke pemasok. */}
                  <div className="row">
                    <div className="col-md-5">
                      <div className="form-group mb-3">
                        <label htmlFor="ttd_id" className="form-label">
                          TANDA TANGAN
                        </label>
                        <select
                          id="ttd_id"
                          className={kelas("ttd_id", "form-control")}
                          value={formData.ttd_id}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              ttd_id: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            -- Tanpa tanda tangan (teken manual) --
                          </option>
                          {ttdData.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nama}
                              {t.jabatan ? ` — ${t.jabatan}` : ""}
                            </option>
                          ))}
                        </select>
                        {pesan("ttd_id") ?? (
                          <small className="text-muted">
                            Dikelola di Sales &rsaquo; Tanda Tangan.
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-md-7">
                      {(() => {
                        const dipilih = ttdData.find(
                          (t) => String(t.id) === String(formData.ttd_id),
                        );

                        if (!dipilih?.uuid) return null;

                        return (
                          <div className="form-group mb-3">
                            <label className="form-label">PRATINJAU</label>
                            <div className="border rounded p-2 bg-light text-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/sales/ttd/gambar/${dipilih.uuid}`}
                                alt={`Tanda tangan ${dipilih.nama}`}
                                style={{ maxHeight: 70, maxWidth: "100%" }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ---------------------------------------------------------
                      2. ITEM

                      Satu daftar datar, tanpa grup. PO tidak pernah menawarkan
                      pilihan — ia perintah beli, dan semua barisnya dibeli.
                      Yang menggantikan kebutuhan memisah bagian: baris JUDUL.
                  --------------------------------------------------------- */}
                  <h6 className="text-uppercase mt-4 mb-2">2. Item PO</h6>

                  <div className="table-responsive">
                    <table className="table table-sm table-bordered tabel-item mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "1%" }}>#</th>
                          <th style={{ minWidth: "220px" }}>ITEM</th>
                          <th style={{ width: "8%" }}>QTY</th>
                          <th style={{ width: "10%" }}>SATUAN</th>
                          <th style={{ width: "13%" }}>REMARKS</th>
                          <th style={{ width: "15%" }}>HARGA</th>
                          <th style={{ width: "7%" }}>DISC %</th>
                          <th style={{ width: "6%" }}>PPh</th>
                          <th style={{ width: "14%" }}>JUMLAH</th>
                          <th style={{ width: "1%" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.item.map((baris, ii) => {
                          // Baris judul TIDAK ikut bernomor — sama seperti di
                          // PDF. Nomor item itu alat rujuk ("kirim dulu item
                          // 4"); memberi judul nomor menggeser nomor barang di
                          // bawahnya menjauh dari yang tertulis di surat jalan.
                          if (!baris.judul) nomorItem += 1;

                          return (
                            <tr key={ii}>
                              <td align="center" className="sel-statis">
                                {baris.judul ? "" : nomorItem}
                              </td>
                              <td>
                                <Textarea
                                  className={kelas(
                                    kunciItem(ii, "deskripsi"),
                                    "form-control-sm",
                                  )}
                                  placeholder={
                                    baris.judul
                                      ? "Judul bagian"
                                      : "Nama / uraian barang"
                                  }
                                  value={baris.deskripsi}
                                  onChange={(e) =>
                                    ubahItem(ii, "deskripsi", e.target.value)
                                  }
                                />
                                {pesan(kunciItem(ii, "deskripsi"))}

                                {/* Saklarnya di sini, menempel pada uraiannya —
                                    bukan di kolom tersendiri. Yang diubah
                                    centang ini memang arti baris ITU, dan
                                    menambah satu kolom sempit lagi untuk saklar
                                    yang jarang dipakai cuma mempersempit kolom
                                    uraian yang justru paling butuh tempat. */}
                                <div className="form-check mt-1">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`judul-${ii}`}
                                    checked={!!baris.judul}
                                    onChange={(e) =>
                                      ubahItem(ii, "judul", e.target.checked)
                                    }
                                  />
                                  <label
                                    className="form-check-label text-muted fs-6"
                                    htmlFor={`judul-${ii}`}
                                  >
                                    Jadikan judul bagian
                                  </label>
                                </div>
                              </td>

                              {/* Baris judul tidak punya angka sama sekali, jadi
                                  seluruh kolom angkanya dilebur jadi satu sel
                                  keterangan. Membiarkannya tampil tapi disabled
                                  menghasilkan deretan kotak abu berisi "0" yang
                                  tetap terbaca sebagai harga, padahal barisnya
                                  judul. */}
                              {baris.judul ? (
                                <td
                                  colSpan={7}
                                  align="center"
                                  className="sel-statis text-muted fst-italic fs-6"
                                >
                                  judul bagian &middot; tidak ikut dihitung
                                </td>
                              ) : (
                                <>
                                  {/* Pesan error sel angka sengaja TIDAK
                                      dicetak di bawah kolomnya — lebarnya cuma
                                      8% dan satu kalimat di situ merentangkan
                                      barisnya jadi empat baris. Yang menandai
                                      cukup tepi merah, dan kalimat lengkapnya
                                      naik ke alert atas form lewat
                                      `ringkasError`. */}
                                  <td>
                                    <NumericFormat
                                      className={kelas(
                                        kunciItem(ii, "qty"),
                                        "form-control form-control-sm text-end",
                                      )}
                                      title={errorForm[kunciItem(ii, "qty")]}
                                      thousandSeparator=","
                                      decimalScale={2}
                                      value={baris.qty}
                                      onValueChange={(v) =>
                                        ubahItem(ii, "qty", v.floatValue ?? 0)
                                      }
                                      onWheel={(e: any) => e.target.blur()}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className={kelas(
                                        kunciItem(ii, "satuan"),
                                        "form-control form-control-sm",
                                      )}
                                      title={errorForm[kunciItem(ii, "satuan")]}
                                      placeholder="unit"
                                      value={baris.satuan ?? ""}
                                      onChange={(e) =>
                                        ubahItem(ii, "satuan", e.target.value)
                                      }
                                    />
                                  </td>
                                  {/* REMARKS tidak ada di form quotation.
                                      Kolomnya ada di PO sistem lama
                                      (`item_remarks`) dan memang dipakai —
                                      nomor part, lead time, merek yang diminta.
                                      Ia ikut tercetak di PDF. */}
                                  <td>
                                    <input
                                      type="text"
                                      className={kelas(
                                        kunciItem(ii, "remarks"),
                                        "form-control form-control-sm",
                                      )}
                                      title={
                                        errorForm[kunciItem(ii, "remarks")]
                                      }
                                      placeholder="no. part / lead time"
                                      value={baris.remarks ?? ""}
                                      onChange={(e) =>
                                        ubahItem(ii, "remarks", e.target.value)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <NumericFormat
                                      className={kelas(
                                        kunciItem(ii, "harga"),
                                        "form-control form-control-sm text-end",
                                      )}
                                      title={errorForm[kunciItem(ii, "harga")]}
                                      thousandSeparator=","
                                      decimalScale={2}
                                      value={baris.harga}
                                      onValueChange={(v) =>
                                        ubahItem(ii, "harga", v.floatValue ?? 0)
                                      }
                                      onWheel={(e: any) => e.target.blur()}
                                    />
                                  </td>
                                  <td>
                                    <NumericFormat
                                      className={kelas(
                                        kunciItem(ii, "diskon_persen"),
                                        "form-control form-control-sm text-end",
                                      )}
                                      title={
                                        errorForm[
                                          kunciItem(ii, "diskon_persen")
                                        ]
                                      }
                                      decimalScale={2}
                                      value={baris.diskon_persen}
                                      onValueChange={(v) =>
                                        ubahItem(
                                          ii,
                                          "diskon_persen",
                                          v.floatValue ?? 0,
                                        )
                                      }
                                      onWheel={(e: any) => e.target.blur()}
                                    />
                                  </td>
                                  <td align="center" className="sel-statis">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      title={
                                        pphPerItem
                                          ? "Item ini dikenakan PPh"
                                          : "PPh sedang dikenakan atas seluruh nilai, jadi centang per item tidak berlaku"
                                      }
                                      checked={
                                        pphPerItem ? !!baris.kena_pph : true
                                      }
                                      disabled={!pphPerItem}
                                      onChange={(e) =>
                                        ubahItem(
                                          ii,
                                          "kena_pph",
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  </td>
                                  <td align="right" className="sel-statis">
                                    {uang(jumlahBaris(baris), formData.currency)}
                                  </td>
                                </>
                              )}
                              <td align="center" className="sel-statis">
                                <button
                                  type="button"
                                  className="btn btn-light btn-xs sharp text-danger"
                                  title="Hapus item"
                                  onClick={() => hapusItem(ii)}
                                >
                                  <i className="fa fa-trash" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn btn-link btn-sm ps-0"
                    onClick={tambahItem}
                  >
                    <i className="fas fa-plus me-2" />
                    Tambah item
                  </button>

                  {pesan("item")}

                  {/* ---------------------------------------------------------
                      3. Syarat & ringkasan
                  --------------------------------------------------------- */}
                  <hr />

                  <div className="row mt-3">
                    <div className="col-lg-7">
                      <h6 className="text-uppercase mb-3">
                        3. Syarat &amp; catatan
                      </h6>

                      <div className="form-group mb-3">
                        <label
                          htmlFor="syarat_pembayaran"
                          className="form-label"
                        >
                          SYARAT &amp; KETENTUAN
                        </label>
                        <Textarea
                          id="syarat_pembayaran"
                          className={
                            errorForm.syarat_pembayaran ? "is-invalid" : ""
                          }
                          placeholder="Pembayaran 30 hari setelah barang diterima lengkap."
                          value={formData.syarat_pembayaran}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              syarat_pembayaran: e.target.value,
                            }))
                          }
                        />
                        {pesan("syarat_pembayaran")}
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="catatan" className="form-label">
                          CATATAN
                        </label>
                        <Textarea
                          id="catatan"
                          className={errorForm.catatan ? "is-invalid" : ""}
                          value={formData.catatan}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              catatan: e.target.value,
                            }))
                          }
                        />
                        {pesan("catatan")}
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <h6 className="text-uppercase mb-3">4. Nilai PO</h6>

                      <div className="border rounded p-3 mb-3">
                        <div className="row g-2">
                          <div className="col-6">
                            <label
                              htmlFor="diskon_persen"
                              className="form-label"
                            >
                              DISKON (%)
                            </label>
                            <NumericFormat
                              id="diskon_persen"
                              className={kelas(
                                "diskon_persen",
                                "form-control text-end",
                              )}
                              decimalScale={2}
                              value={formData.diskon_persen}
                              onValueChange={(v) =>
                                setFormData((s) => ({
                                  ...s,
                                  diskon_persen: v.floatValue ?? 0,
                                }))
                              }
                              onWheel={(e: any) => e.target.blur()}
                            />
                            {pesan("diskon_persen")}
                          </div>
                          <div className="col-6">
                            <label htmlFor="ppn_persen" className="form-label">
                              PPN (%)
                            </label>
                            <NumericFormat
                              id="ppn_persen"
                              className={kelas(
                                "ppn_persen",
                                "form-control text-end",
                              )}
                              decimalScale={2}
                              value={formData.ppn_persen}
                              onValueChange={(v) =>
                                setFormData((s) => ({
                                  ...s,
                                  ppn_persen: v.floatValue ?? 0,
                                }))
                              }
                              onWheel={(e: any) => e.target.blur()}
                            />
                            {pesan("ppn_persen")}
                          </div>
                          <div className="col-6">
                            <label htmlFor="pph_persen" className="form-label">
                              PPh (%)
                            </label>
                            <NumericFormat
                              id="pph_persen"
                              className={kelas(
                                "pph_persen",
                                "form-control text-end",
                              )}
                              decimalScale={2}
                              value={formData.pph_persen}
                              onValueChange={(v) =>
                                setFormData((s) => ({
                                  ...s,
                                  pph_persen: v.floatValue ?? 0,
                                }))
                              }
                              onWheel={(e: any) => e.target.blur()}
                            />
                            {pesan("pph_persen")}
                          </div>
                          <div className="col-6">
                            <label htmlFor="pph_dasar" className="form-label">
                              PPh DIKENAKAN ATAS
                            </label>
                            <select
                              id="pph_dasar"
                              className="form-select"
                              value={formData.pph_dasar}
                              onChange={(e) =>
                                setFormData((s) => ({
                                  ...s,
                                  pph_dasar: e.target.value as "item" | "total",
                                }))
                              }
                            >
                              <option value="item">Item yang dicentang</option>
                              <option value="total">Seluruh nilai</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-muted fs-6 mb-0 mt-2">
                          {pphPerItem ? (
                            <>
                              Centang kolom <strong>PPh</strong> di tabel item
                              untuk memilih item yang dikenakan — biasanya baris
                              jasa, bukan barang.
                            </>
                          ) : (
                            <>
                              PPh dikenakan atas seluruh nilai, jadi centang per
                              item di tabel tidak berlaku.
                            </>
                          )}
                        </p>
                      </div>

                      <table className="table table-sm mb-0">
                        <tbody>
                          {/* SELURUH baris ditampilkan, termasuk yang masih
                              nol. Ini panel kerja, bukan dokumen cetak: baris
                              yang muncul-hilang mengikuti isian membuat angkanya
                              sulit dicocokkan, dan yang tarifnya belum diisi
                              tidak pernah tahu barisnya ada. Di PDF sebaliknya —
                              di sana baris bernilai nol memang tidak dicetak. */}
                          <tr>
                            <td className="text-muted">Subtotal</td>
                            <td align="right">
                              {uang(subtotal, formData.currency)}
                            </td>
                          </tr>
                          <tr className={diskonPersen > 0 ? "" : "text-muted"}>
                            <td className="text-muted">
                              Diskon ({diskonPersen}%)
                            </td>
                            <td align="right">
                              {diskonNominal > 0 ? "- " : ""}
                              {uang(diskonNominal, formData.currency)}
                            </td>
                          </tr>
                          <tr className={ppnPersen > 0 ? "" : "text-muted"}>
                            <td className="text-muted">PPN ({ppnPersen}%)</td>
                            <td align="right">
                              {uang(ppnNominal, formData.currency)}
                            </td>
                          </tr>
                          <tr className={pphNominal > 0 ? "" : "text-muted"}>
                            <td className="text-muted">
                              PPh ({pphPersen}%
                              {pphPerItem
                                ? ", item dicentang"
                                : ", seluruh nilai"}
                              )
                            </td>
                            <td align="right">
                              {pphNominal > 0 ? "- " : ""}
                              {uang(pphNominal, formData.currency)}
                            </td>
                          </tr>
                          <tr className="fw-bold border-top">
                            <td>GRAND TOTAL</td>
                            <td align="right">
                              {uang(total, formData.currency)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <p className="text-muted fs-6 mt-2 mb-0">
                        Angka di atas pratinjau. Nilai final dihitung server saat
                        disimpan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-footer py-3">
                  <a href={kembaliKeDaftar} className="btn btn-secondary me-2">
                    CLOSE
                  </a>

                  {isLoadingSubmit ? (
                    <button type="button" className="btn btn-success" disabled>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      LOADING ...
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success">
                      SAVE DATA
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
