"use client";

import Alert from "@/components/Alert";
import Textarea from "@/components/Textarea";
import {
  CustomerProps,
  QuotationCurrency,
  QuotationGrupProps,
  QuotationItemProps,
  QuotationProps,
} from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import Select from "react-select";
import {
  createQuotation,
  editQuotation,
  getCustomerPilihan,
  QuotationFormProps,
  unggahGambarQuotation,
} from "../_libs/action";
import {
  ErrorForm,
  kunciGrup,
  kunciItem,
  MAKS_GAMBAR,
  ringkasError,
  uang,
  validasiQuotation,
} from "../_libs/skema";

/**
 * Form quotation — halaman penuh, dipakai `create/page.tsx` dan `edit/page.tsx`.
 *
 * Bukan modal seperti form lain di repo ini: satu penawaran bisa berisi puluhan
 * baris item bergrup, dan tabel sepanjang itu di dalam modal memaksa dua
 * scrollbar bersarang. Polanya mengikuti `hr/datakaryawan/create`.
 *
 * ## Susunan layar
 *
 * Empat bagian bernomor: (1) informasi penawaran, (2) item, (3) syarat &
 * catatan, (4) nilai. Urutannya sengaja sama dengan urutan membaca surat
 * penawaran yang jadi, supaya isian dan hasilnya bisa dicocokkan sambil jalan.
 *
 * ## Grup muncul hanya kalau dipakai
 *
 * Di database item SELALU berada di dalam grup, tapi di layar konsep itu
 * disembunyikan sampai dibutuhkan: satu grup = tabel item biasa, tanpa kepala
 * grup dan tanpa subtotal grup. Menampilkan "GRUP 1" beserta subtotalnya untuk
 * satu-satunya grup hanya menambah kotak tanpa menambah keterangan, dan itulah
 * yang membuat versi sebelumnya membingungkan.
 *
 * Begitu ada grup kedua, barulah muncul kepala grup DAN pilihan artinya:
 *
 * - **Kategori** ("Alat Elektronik" + "Jasa") — subtotalnya dijumlahkan, kena
 *   diskon/PPN/PPh, ada grand total.
 * - **Pilihan paket** ("Opsi A" + "Opsi B") — menjumlahkannya tidak berarti
 *   apa-apa, jadi diskon/PPN/PPh disembunyikan (backend memaksanya nol) dan
 *   yang tampil hanya subtotal tiap grup.
 *
 * Pilihan itu ditaruh menempel pada daftar grup, bukan di panel nilai: ia
 * menentukan arti grup, jadi harus terlihat saat grupnya disusun.
 *
 * ## Yang TIDAK disembunyikan
 *
 * Kolom **PPh** di tabel dan seluruh baris di panel nilai (Diskon, PPN, PPh)
 * selalu tampil selama penawarannya bukan pilihan paket — termasuk saat
 * nilainya masih nol.
 *
 * Kecuali **DPP** (subtotal − diskon), yang tidak ditampilkan di mana pun. Ia
 * tetap dihitung dan tetap jadi dasar PPN/PPh, tapi untuk penawaran tanpa
 * diskon nilainya sama persis dengan Subtotal — barisnya cuma mengulang angka
 * di atasnya.
 *
 * Sempat dibuat muncul-hilang mengikuti isian, dan itu salah: angkanya jadi
 * sulit dicocokkan karena barisnya berpindah sambil user mengetik, dan yang
 * belum mengisi tarif tidak pernah tahu barisnya ada. Yang bernilai nol cuma
 * diredupkan. Di PDF sebaliknya — di sana baris bernilai nol memang tidak
 * dicetak, karena itu dokumen jadi, bukan panel kerja.
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
 * menyela submit lebih dulu, dan pesannya tidak bisa diseragamkan. Yang lebih
 * menentukan di form ini: field yang salah bisa berada di dalam grup yang
 * sedang tidak terlihat, dan browser menolak memfokuskan field tersembunyi
 * tanpa memberi tahu apa-apa — user cuma melihat tombol simpan yang diam.
 *
 * Error item dikunci path (`grup.0.item.2.qty`), jadi pesannya menempel di sel
 * yang benar; ringkasannya ikut naik ke alert atas form karena tabel itemnya
 * bisa sepanjang layar.
 */
type Props = {
  /** Kosong = mode create. */
  quotationEdit?: QuotationProps | null;
};

const ITEM_KOSONG = (): QuotationItemProps => ({
  judul: false,
  deskripsi: "",
  satuan: "",
  qty: 1,
  harga: 0,
  diskon_persen: 0,
  kena_pph: false,
  gambar: [],
});

/**
 * Nama grup tunggal yang TIDAK pernah terlihat user.
 *
 * Selama grupnya cuma satu, kepala grup beserta kolom namanya disembunyikan —
 * tapi backend tetap menuntut nama, jadi nilai ini yang mengisi. Begitu grup
 * kedua muncul dan namanya jadi terlihat, `namaGrup()` menggantinya dengan
 * "Grup 1".
 */
const NAMA_TERSEMBUNYI = "Item";

const GRUP_KOSONG = (nama = NAMA_TERSEMBUNYI): QuotationGrupProps => ({
  nama,
  item: [ITEM_KOSONG()],
});

/**
 * Nama untuk grup ke-`n`, dihitung dari nama yang SUDAH ada — bukan dari
 * `length + 1`.
 *
 * Panjang daftar salah jadi acuan begitu ada grup yang dihapus: dari "Grup 1,
 * Grup 2, Grup 3", menghapus yang tengah menyisakan dua grup, dan grup
 * berikutnya akan dinamai "Grup 3" lagi — bertabrakan dengan yang sudah ada.
 */
const namaGrupBaru = (daftar: QuotationGrupProps[]) => {
  const tertinggi = daftar.reduce((maks, g) => {
    const cocok = g.nama.trim().match(/^Grup (\d+)$/);
    return cocok ? Math.max(maks, Number(cocok[1])) : maks;
  }, 0);

  return `Grup ${Math.max(tertinggi, daftar.length) + 1}`;
};

const angka = (nilai: number | string): number => {
  const n = typeof nilai === "number" ? nilai : parseFloat(String(nilai));
  return Number.isFinite(n) ? n : 0;
};

/** Tanggal hari ini sebagai "YYYY-MM-DD" memakai komponen LOKAL (WIB). */
const hariIni = (tambahHari = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + tambahHari);
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
};

export default function QuotationForm({ quotationEdit }: Props) {
  const mode = quotationEdit ? "edit" : "create";
  const { push } = useRouter();

  /**
   * Alamat daftar yang harus dituju setelah selesai — lengkap dengan halaman
   * asalnya. Tanpa ini, menyunting baris di halaman 4 selalu memulangkan user
   * ke halaman 1, dan dengan 5.000-an penawaran itu berarti menyusuri daftarnya
   * dari awal cuma untuk melihat hasil suntingannya.
   */
  const halaman = Number(useSearchParams().get("page"));
  const kembaliKeDaftar =
    Number.isInteger(halaman) && halaman > 1
      ? `/sales/quotation?page=${halaman}`
      : "/sales/quotation";

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
        "quotation:hasil",
        JSON.stringify({ color: "success", message: "Success", subMessage }),
      );
    } catch {
      // Private window / cookie diblokir. Banner yang hilang bukan alasan
      // untuk menggagalkan penyimpanan yang sudah berhasil.
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
  const [unggah, setUnggah] = useState<Record<string, boolean>>({});
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  const [formData, setFormData] = useState<QuotationFormProps>({
    customer_id: quotationEdit?.customer.id ?? "",
    revisi: quotationEdit?.revisi ?? 0,
    tanggal: quotationEdit?.tanggal ?? hariIni(),
    berlaku_sampai: quotationEdit?.berlaku_sampai ?? hariIni(30),
    attn: quotationEdit?.attn ?? "",
    perihal: quotationEdit?.perihal ?? "",
    syarat_pembayaran: quotationEdit?.syarat_pembayaran ?? "",
    catatan: quotationEdit?.catatan ?? "",
    diskon_persen: quotationEdit?.diskon_persen ?? 0,
    // PPN default NOL, bukan 11.
    //
    // Tarif yang terisi sendiri di form baru adalah tarif yang ikut tercetak
    // tanpa pernah diputuskan siapa pun, dan penawaran yang salah memungut
    // pajak jauh lebih mahal ongkosnya daripada mengetik satu angka. Yang
    // memang kena PPN mengisinya sadar.
    ppn_persen: quotationEdit?.ppn_persen ?? 0,
    pph_persen: quotationEdit?.pph_persen ?? 2,
    pph_dasar: quotationEdit?.pph_dasar ?? "item",
    tampilkan_grand_total: quotationEdit?.tampilkan_grand_total ?? true,
    currency: quotationEdit?.currency ?? "IDR",
    grup:
      quotationEdit?.grup && quotationEdit.grup.length > 0
        ? quotationEdit.grup.map((g) => ({
            nama: g.nama,
            item: g.item.map((i) => ({ ...i, gambar: i.gambar ?? [] })),
          }))
        : [GRUP_KOSONG()],
  });

  useEffect(() => {
    const ambil = async () => {
      setIsLoadingPage(true);
      try {
        const result = await getCustomerPilihan();
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

  // ---------------------------------------------------------------- grup
  const ubahGrup = (gi: number, ubah: Partial<QuotationGrupProps>) =>
    setFormData((s) => ({
      ...s,
      grup: s.grup.map((g, i) => (i === gi ? { ...g, ...ubah } : g)),
    }));

  const tambahGrup = () =>
    setFormData((s) => ({
      ...s,
      grup: [
        // Grup pertama ikut dinamai ulang saat kepala grup MULAI terlihat.
        // Sebelum ini ia bernama "Item" — nama tersembunyi yang tidak pernah
        // dimaksudkan untuk dibaca — sehingga begitu grup kedua ditambahkan
        // layarnya berbunyi "Item" dan "Grup 2", seolah yang pertama bukan
        // grup. Hanya menyentuh yang namanya masih default: nama yang sudah
        // diketik user, atau yang datang dari penawaran lama, dibiarkan.
        ...s.grup.map((g, i) =>
          i === 0 && g.nama.trim() === NAMA_TERSEMBUNYI
            ? { ...g, nama: "Grup 1" }
            : g,
        ),
        GRUP_KOSONG(namaGrupBaru(s.grup)),
      ],
    }));

  const hapusGrup = (gi: number) =>
    setFormData((s) => ({
      ...s,
      // Backend menolak penawaran tanpa grup, jadi grup terakhir dikosongkan
      // isinya — bukan dihapus — supaya usernya tidak terjebak form tanpa baris.
      grup:
        s.grup.length === 1
          ? [GRUP_KOSONG()]
          : s.grup.filter((_, i) => i !== gi),
    }));

  // ---------------------------------------------------------------- item
  const ubahItem = (
    gi: number,
    ii: number,
    field: keyof QuotationItemProps,
    nilai: unknown,
  ) =>
    setFormData((s) => ({
      ...s,
      grup: s.grup.map((g, i) =>
        i !== gi
          ? g
          : {
              ...g,
              item: g.item.map((it, j) =>
                j === ii ? { ...it, [field]: nilai } : it,
              ),
            },
      ),
    }));

  const tambahItem = (gi: number) =>
    setFormData((s) => ({
      ...s,
      grup: s.grup.map((g, i) =>
        i === gi ? { ...g, item: [...g.item, ITEM_KOSONG()] } : g,
      ),
    }));

  const hapusItem = (gi: number, ii: number) =>
    setFormData((s) => ({
      ...s,
      grup: s.grup.map((g, i) =>
        i !== gi
          ? g
          : {
              ...g,
              item:
                g.item.length === 1
                  ? [ITEM_KOSONG()]
                  : g.item.filter((_, j) => j !== ii),
            },
      ),
    }));

  // -------------------------------------------------------------- gambar
  const handleUnggah = async (
    gi: number,
    ii: number,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    const kunci = `${gi}-${ii}`;
    setUnggah((s) => ({ ...s, [kunci]: true }));

    try {
      // Berurutan, bukan Promise.all: tiap berkas diperkecil server dengan GD,
      // dan mengirim enam foto sekaligus membuat PHP memegang enam bitmap
      // besar di memori pada saat yang sama.
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("gambar", file);

        const hasil = await unggahGambarQuotation(form);

        if (!hasil.status || !hasil.uuid) {
          setAlert({
            status: true,
            color: "danger",
            message: "Gagal mengunggah gambar",
            subMessage: hasil.message,
          });
          break;
        }

        const uuid = hasil.uuid;

        // Dibaca dari state TERKINI, bukan dari `formData` yang tertangkap
        // closure — kalau tidak, unggahan kedua menimpa hasil yang pertama.
        setFormData((s) => ({
          ...s,
          grup: s.grup.map((g, i) =>
            i !== gi
              ? g
              : {
                  ...g,
                  item: g.item.map((it, j) =>
                    j !== ii
                      ? it
                      : {
                          ...it,
                          gambar: [
                            ...(it.gambar ?? []),
                            { uuid, nama_asli: hasil.nama_asli },
                          ],
                        },
                  ),
                },
          ),
        }));
      }
    } finally {
      setUnggah((s) => ({ ...s, [kunci]: false }));
    }
  };

  const hapusGambar = (gi: number, ii: number, uuid: string) =>
    setFormData((s) => ({
      ...s,
      grup: s.grup.map((g, i) =>
        i !== gi
          ? g
          : {
              ...g,
              item: g.item.map((it, j) =>
                j !== ii
                  ? it
                  : {
                      ...it,
                      gambar: (it.gambar ?? []).filter((x) => x.uuid !== uuid),
                    },
              ),
            },
      ),
    }));

  // -------------------------------------------------------------- hitung
  // Baris judul tidak pernah menyumbang nilai — sama seperti di
  // QuotationController::hitung(), yang jadi acuannya.
  const jumlahBaris = (b: QuotationItemProps) => {
    if (b.judul) return 0;
    const kotor = angka(b.qty) * angka(b.harga);
    return kotor - (kotor * angka(b.diskon_persen)) / 100;
  };

  const subtotalGrup = (g: QuotationGrupProps) =>
    g.item.reduce((t, b) => t + jumlahBaris(b), 0);

  const pilihan = !formData.tampilkan_grand_total;
  const subtotal = formData.grup.reduce((t, g) => t + subtotalGrup(g), 0);

  const diskonPersen = pilihan ? 0 : angka(formData.diskon_persen);
  const ppnPersen = pilihan ? 0 : angka(formData.ppn_persen);
  const pphPersen = pilihan ? 0 : angka(formData.pph_persen);

  const diskonNominal = (subtotal * diskonPersen) / 100;
  const dpp = subtotal - diskonNominal;
  const ppnNominal = (dpp * ppnPersen) / 100;

  const dasarItem = formData.grup
    .flatMap((g) => g.item)
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
    const periksa = validasiQuotation(formData);

    if (!periksa.sukses) {
      setErrorForm(periksa.error);
      setAlert({
        status: true,
        color: "danger",
        message: "Periksa kembali isian form",
        subMessage: ringkasError(periksa.error, formData.grup.length > 1),
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
          ? await editQuotation({ ...formData, id: quotationEdit!.id })
          : await createQuotation(formData);

      if (result.status) {
        // Langsung pindah, tanpa jeda 1 detik seperti sebelumnya: bannernya
        // sekarang muncul di halaman daftar, jadi menahan user di form yang
        // sudah selesai hanya membuat tombol simpan terasa menggantung.
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

  const opsiCustomer = customerData.map((c) => ({
    value: c.id,
    label: `${c.kode} — ${c.nama_customer}`,
  }));

  // Grup baru "ada" kalau memang lebih dari satu. Penawaran biasa cukup satu
  // grup tanpa kepala, jadi konsep grup tidak muncul sampai dibutuhkan.
  const pakaiGrup = formData.grup.length > 1;

  // Kolom PPh di tabel hanya berguna kalau tarifnya diisi DAN dasarnya
  // per-item. Di luar itu ia kolom mati yang cuma bikin bingung.
  // Kolom PPh di tabel item ADA selama penawarannya bukan pilihan paket.
  //
  // Sempat disembunyikan saat tarif PPh masih 0 — hasilnya justru bikin
  // bingung: kolomnya muncul dan hilang sendiri sambil user mengetik tarif,
  // dan yang belum mengisi tarif tidak pernah tahu fitur centangnya ada.
  // Kolom isian ditampilkan apa adanya; yang disesuaikan cuma keadaan aktifnya.
  const kolomPph = !pilihan;

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
                      Mengubah <strong>{quotationEdit?.nomor}</strong>.
                    </div>
                  )}

                  <h6 className="text-uppercase mb-3">
                    1. Informasi penawaran
                  </h6>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label className="form-label">CUSTOMER</label>
                        <Select
                          instanceId="quotation-customer"
                          placeholder="Select Customer"
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
                            setFormData({
                              ...formData,
                              customer_id: e?.value ?? "",
                            })
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
                              Customer tidak bisa diganti — nomor penawaran
                              sudah terbit atas nama ini. Buat penawaran baru
                              bila customernya berbeda.
                            </small>
                          ) : null)}
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
                          placeholder="Nama kontak di customer"
                          value={formData.attn}
                          onChange={(e) =>
                            setFormData({ ...formData, attn: e.target.value })
                          }
                        />
                        {pesan("attn")}
                      </div>
                    </div>

                    {/* Revisi HANYA di mode edit. Penawaran yang baru dibuat
                        menurut definisinya belum pernah direvisi, jadi
                        menanyakannya di form create cuma menawarkan isian yang
                        satu-satunya jawaban benarnya nol.

                        Angkanya diisi tangan, bukan dihitung sistem: yang
                        menentukan sebuah penawaran itu "revisi ke-2" adalah
                        kesepakatan dengan customer di luar aplikasi, sering
                        sudah terlanjur disebut begitu di email sebelum datanya
                        masuk ke sini. */}
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
                              setFormData({
                                ...formData,
                                revisi: v.floatValue ?? 0,
                              })
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
                          TANGGAL
                        </label>
                        <input
                          id="tanggal"
                          type="date"
                          className={kelas("tanggal")}
                          value={formData.tanggal}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tanggal: e.target.value,
                            })
                          }
                        />
                        {pesan("tanggal")}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group mb-3">
                        <label htmlFor="berlaku_sampai" className="form-label">
                          BERLAKU SAMPAI
                        </label>
                        <input
                          id="berlaku_sampai"
                          type="date"
                          className={kelas("berlaku_sampai")}
                          value={formData.berlaku_sampai}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              berlaku_sampai: e.target.value,
                            })
                          }
                        />
                        {pesan("berlaku_sampai")}
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
                          placeholder="Pengadaan Panel dan Jasa Instalasi"
                          value={formData.perihal}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              perihal: e.target.value,
                            })
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
                            setFormData({
                              ...formData,
                              currency: e.target.value as QuotationCurrency,
                            })
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

                  {/* ---------------------------------------------------------
                      2. ITEM

                      Grup sengaja TIDAK terlihat sampai dibutuhkan. Penawaran
                      biasa cuma punya satu grup, dan menampilkan judul grup +
                      subtotal grup untuk satu grup saja hanya menambah kotak
                      tanpa menambah keterangan. Begitu user menekan "Pakai
                      grup", barulah kepala grup muncul.
                  --------------------------------------------------------- */}
                  <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                    <h6 className="mb-0 text-uppercase">2. Item penawaran</h6>
                    {!pakaiGrup && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={tambahGrup}
                      >
                        <i className="fas fa-layer-group me-2" />
                        PAKAI GRUP
                      </button>
                    )}
                  </div>

                  {/* Penentu bentuk dokumen. Ditaruh DI SINI, menempel pada
                      itemnya, bukan di panel total — ini yang menentukan apakah
                      grup dijumlahkan atau dianggap pilihan, jadi user harus
                      melihatnya saat menyusun grup. */}
                  {pakaiGrup && (
                    <div className="alert alert-light border py-2 px-3 mb-3">
                      <div className="row g-2 align-items-center">
                        <div className="col-md-auto fw-bold">
                          Grup ini artinya:
                        </div>
                        <div className="col-md">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="jenis_grup"
                              id="jenis_jumlah"
                              checked={formData.tampilkan_grand_total}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  tampilkan_grand_total: true,
                                })
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="jenis_jumlah"
                            >
                              <strong>Kategori</strong> — dijumlahkan jadi satu
                              grand total
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="jenis_grup"
                              id="jenis_pilihan"
                              checked={!formData.tampilkan_grand_total}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  tampilkan_grand_total: false,
                                })
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="jenis_pilihan"
                            >
                              <strong>Pilihan paket</strong> — customer pilih
                              salah satu, tanpa grand total
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.grup.map((g, gi) => (
                    <div
                      className={pakaiGrup ? "border rounded mb-3" : "mb-3"}
                      key={gi}
                    >
                      {pakaiGrup && (
                        <div className="d-flex align-items-center gap-2 p-2 bg-light border-bottom">
                          <span className="badge badge-primary light">
                            GRUP {gi + 1}
                          </span>
                          <div style={{ maxWidth: "20rem", width: "100%" }}>
                            <input
                              type="text"
                              className={kelas(
                                kunciGrup(gi),
                                "form-control form-control-sm",
                              )}
                              placeholder="Nama grup (mis. Alat Elektronik / Opsi A)"
                              value={g.nama}
                              onChange={(e) =>
                                ubahGrup(gi, { nama: e.target.value })
                              }
                            />
                            {pesan(kunciGrup(gi))}
                          </div>
                          <span className="ms-auto fw-bold">
                            {uang(subtotalGrup(g), formData.currency)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-light btn-xs sharp text-danger"
                            title="Hapus grup ini"
                            onClick={() => hapusGrup(gi)}
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      )}

                      <div className={pakaiGrup ? "p-2" : ""}>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered tabel-item mb-0">
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: "1%" }}>#</th>
                                <th style={{ minWidth: "240px" }}>ITEM</th>
                                <th style={{ width: "9%" }}>QTY</th>
                                <th style={{ width: "11%" }}>SATUAN</th>
                                <th style={{ width: "16%" }}>HARGA</th>
                                <th style={{ width: "8%" }}>DISC %</th>
                                {/* Kolom PPh cuma muncul kalau memang dipakai —
                                    penawaran tanpa PPh tidak perlu melihatnya. */}
                                {kolomPph && (
                                  <th style={{ width: "6%" }}>PPh</th>
                                )}
                                <th style={{ width: "16%" }}>JUMLAH</th>
                                <th style={{ width: "1%" }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.item.map((baris, ii) => {
                                const kunci = `${gi}-${ii}`;
                                const jumlahGambar = (baris.gambar ?? [])
                                  .length;
                                const penuh = jumlahGambar >= MAKS_GAMBAR;

                                // Baris judul TIDAK ikut bernomor — sama
                                // seperti di PDF. Nomor item itu alat rujuk
                                // ("tolong revisi item 4"); memberi judul nomor
                                // menggeser nomor barang di bawahnya menjauh
                                // dari yang tertulis di PO customer.
                                if (!baris.judul) nomorItem += 1;

                                return (
                                  <tr key={ii}>
                                    <td align="center" className="sel-statis">
                                      {baris.judul ? "" : nomorItem}
                                    </td>
                                    <td>
                                      <Textarea
                                        className={kelas(
                                          kunciItem(gi, ii, "deskripsi"),
                                          "form-control-sm",
                                        )}
                                        placeholder={
                                          baris.judul
                                            ? "Judul bagian"
                                            : "Nama / uraian item"
                                        }
                                        value={baris.deskripsi}
                                        onChange={(e) =>
                                          ubahItem(
                                            gi,
                                            ii,
                                            "deskripsi",
                                            e.target.value,
                                          )
                                        }
                                      />
                                      {pesan(kunciItem(gi, ii, "deskripsi"))}

                                      {/* Saklarnya di sini, menempel pada
                                          uraiannya — bukan di kolom tersendiri.
                                          Yang diubah centang ini memang arti
                                          baris ITU, dan menambah satu kolom
                                          sempit lagi untuk saklar yang jarang
                                          dipakai cuma mempersempit kolom uraian
                                          yang justru paling butuh tempat. */}
                                      <div className="form-check mt-1">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`judul-${gi}-${ii}`}
                                          checked={!!baris.judul}
                                          onChange={(e) =>
                                            ubahItem(
                                              gi,
                                              ii,
                                              "judul",
                                              e.target.checked,
                                            )
                                          }
                                        />
                                        <label
                                          className="form-check-label text-muted fs-6"
                                          htmlFor={`judul-${gi}-${ii}`}
                                        >
                                          Jadikan judul bagian
                                        </label>
                                      </div>

                                      <div
                                        className="lampiran-item"
                                        hidden={!!baris.judul}
                                      >
                                        {(baris.gambar ?? []).map((gb) => (
                                          <span className="kotak" key={gb.uuid}>
                                            <img
                                              src={`/api/sales/quotation/gambar/${gb.uuid}`}
                                              alt={gb.nama_asli}
                                              title={gb.nama_asli}
                                            />
                                            <button
                                              type="button"
                                              className="buang"
                                              title="Hapus gambar ini"
                                              onClick={() =>
                                                hapusGambar(gi, ii, gb.uuid)
                                              }
                                            >
                                              <i className="fa fa-times" />
                                            </button>
                                          </span>
                                        ))}

                                        {/* Tombolnya BERLABEL, bukan kotak "+"
                                            polos: gambar item itu fitur yang
                                            jarang dipakai, jadi satu ikon plus
                                            menggantung di bawah uraian item
                                            tidak memberi tahu apa pun tentang
                                            apa yang akan ditambahkan. */}
                                        <label
                                          className={`tambah${penuh || unggah[kunci] ? " nonaktif" : ""}`}
                                          title={
                                            penuh
                                              ? `Maksimal ${MAKS_GAMBAR} gambar per item`
                                              : "JPG, PNG, atau WEBP — boleh pilih beberapa sekaligus"
                                          }
                                        >
                                          {unggah[kunci] ? (
                                            <span className="spinner-border spinner-border-sm" />
                                          ) : (
                                            <i className="fas fa-image" />
                                          )}
                                          <span>
                                            {unggah[kunci]
                                              ? "Mengunggah ..."
                                              : penuh
                                                ? `Maksimal ${MAKS_GAMBAR} gambar`
                                                : "Tambah gambar"}
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            hidden
                                            disabled={penuh || !!unggah[kunci]}
                                            onChange={(e) => {
                                              handleUnggah(
                                                gi,
                                                ii,
                                                e.target.files,
                                              );
                                              e.target.value = "";
                                            }}
                                          />
                                        </label>

                                        {jumlahGambar > 0 && (
                                          <span className="hitung">
                                            {jumlahGambar}/{MAKS_GAMBAR}
                                          </span>
                                        )}
                                      </div>
                                      {pesan(kunciItem(gi, ii, "gambar"))}
                                    </td>
                                    {/* Baris judul tidak punya angka sama
                                        sekali, jadi seluruh kolom angkanya
                                        dilebur jadi satu sel keterangan.
                                        Sebelumnya sempat dibiarkan tampil tapi
                                        disabled — hasilnya deretan kotak abu
                                        berisi "0" yang tetap terbaca sebagai
                                        harga, padahal barisnya judul. */}
                                    {baris.judul ? (
                                      <td
                                        colSpan={kolomPph ? 6 : 5}
                                        align="center"
                                        className="sel-statis text-muted fst-italic fs-6"
                                      >
                                        judul bagian &middot; tidak ikut
                                        dihitung
                                      </td>
                                    ) : (
                                      <>
                                        {/* Pesan error sel angka sengaja TIDAK
                                        dicetak di bawah kolomnya — lebarnya
                                        cuma 9% dan satu kalimat di situ
                                        merentangkan barisnya jadi empat baris.
                                        Yang menandai cukup tepi merah, dan
                                        kalimat lengkapnya naik ke alert atas
                                        form lewat `ringkasError`. */}
                                        <td>
                                          <NumericFormat
                                            className={kelas(
                                              kunciItem(gi, ii, "qty"),
                                              "form-control form-control-sm text-end",
                                            )}
                                            title={
                                              errorForm[
                                                kunciItem(gi, ii, "qty")
                                              ]
                                            }
                                            thousandSeparator=","
                                            decimalScale={2}
                                            value={baris.qty}
                                            onValueChange={(v) =>
                                              ubahItem(
                                                gi,
                                                ii,
                                                "qty",
                                                v.floatValue ?? 0,
                                              )
                                            }
                                            onWheel={(e: any) =>
                                              e.target.blur()
                                            }
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            className={kelas(
                                              kunciItem(gi, ii, "satuan"),
                                              "form-control form-control-sm",
                                            )}
                                            title={
                                              errorForm[
                                                kunciItem(gi, ii, "satuan")
                                              ]
                                            }
                                            placeholder="unit"
                                            value={baris.satuan ?? ""}
                                            onChange={(e) =>
                                              ubahItem(
                                                gi,
                                                ii,
                                                "satuan",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <NumericFormat
                                            className={kelas(
                                              kunciItem(gi, ii, "harga"),
                                              "form-control form-control-sm text-end",
                                            )}
                                            title={
                                              errorForm[
                                                kunciItem(gi, ii, "harga")
                                              ]
                                            }
                                            thousandSeparator=","
                                            decimalScale={2}
                                            value={baris.harga}
                                            onValueChange={(v) =>
                                              ubahItem(
                                                gi,
                                                ii,
                                                "harga",
                                                v.floatValue ?? 0,
                                              )
                                            }
                                            onWheel={(e: any) =>
                                              e.target.blur()
                                            }
                                          />
                                        </td>
                                        <td>
                                          <NumericFormat
                                            className={kelas(
                                              kunciItem(
                                                gi,
                                                ii,
                                                "diskon_persen",
                                              ),
                                              "form-control form-control-sm text-end",
                                            )}
                                            title={
                                              errorForm[
                                                kunciItem(
                                                  gi,
                                                  ii,
                                                  "diskon_persen",
                                                )
                                              ]
                                            }
                                            decimalScale={2}
                                            value={baris.diskon_persen}
                                            onValueChange={(v) =>
                                              ubahItem(
                                                gi,
                                                ii,
                                                "diskon_persen",
                                                v.floatValue ?? 0,
                                              )
                                            }
                                            onWheel={(e: any) =>
                                              e.target.blur()
                                            }
                                          />
                                        </td>
                                        {kolomPph && (
                                          <td
                                            align="center"
                                            className="sel-statis"
                                          >
                                            <input
                                              type="checkbox"
                                              className="form-check-input"
                                              title={
                                                pphPerItem
                                                  ? "Item ini dikenakan PPh"
                                                  : "PPh sedang dikenakan atas seluruh nilai, jadi centang per item tidak berlaku"
                                              }
                                              checked={
                                                pphPerItem
                                                  ? !!baris.kena_pph
                                                  : true
                                              }
                                              disabled={!pphPerItem}
                                              onChange={(e) =>
                                                ubahItem(
                                                  gi,
                                                  ii,
                                                  "kena_pph",
                                                  e.target.checked,
                                                )
                                              }
                                            />
                                          </td>
                                        )}
                                        <td
                                          align="right"
                                          className="sel-statis"
                                        >
                                          {uang(
                                            jumlahBaris(baris),
                                            formData.currency,
                                          )}
                                        </td>
                                      </>
                                    )}
                                    <td align="center" className="sel-statis">
                                      <button
                                        type="button"
                                        className="btn btn-light btn-xs sharp text-danger"
                                        title="Hapus item"
                                        onClick={() => hapusItem(gi, ii)}
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
                          onClick={() => tambahItem(gi)}
                        >
                          <i className="fas fa-plus me-2" />
                          Tambah item
                        </button>
                      </div>
                    </div>
                  ))}

                  {pakaiGrup && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mb-3"
                      onClick={tambahGrup}
                    >
                      <i className="fas fa-layer-group me-2" />
                      TAMBAH GRUP
                    </button>
                  )}

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
                          placeholder="Pembayaran 30 hari setelah invoice diterima."
                          value={formData.syarat_pembayaran}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              syarat_pembayaran: e.target.value,
                            })
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
                            setFormData({
                              ...formData,
                              catatan: e.target.value,
                            })
                          }
                        />
                        {pesan("catatan")}
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <h6 className="text-uppercase mb-3">
                        4. Nilai penawaran
                      </h6>

                      {pilihan ? (
                        <div className="alert alert-warning solid py-2 px-3">
                          Penawaran <strong>pilihan paket</strong>: diskon, PPN,
                          dan PPh tidak dikenakan karena tidak ada satu nilai
                          untuk dihitung. Yang tercetak hanya subtotal tiap
                          grup.
                        </div>
                      ) : (
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
                                  setFormData({
                                    ...formData,
                                    diskon_persen: v.floatValue ?? 0,
                                  })
                                }
                                onWheel={(e: any) => e.target.blur()}
                              />
                              {pesan("diskon_persen")}
                            </div>
                            <div className="col-6">
                              <label
                                htmlFor="ppn_persen"
                                className="form-label"
                              >
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
                                  setFormData({
                                    ...formData,
                                    ppn_persen: v.floatValue ?? 0,
                                  })
                                }
                                onWheel={(e: any) => e.target.blur()}
                              />
                              {pesan("ppn_persen")}
                            </div>
                            <div className="col-6">
                              <label
                                htmlFor="pph_persen"
                                className="form-label"
                              >
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
                                  setFormData({
                                    ...formData,
                                    pph_persen: v.floatValue ?? 0,
                                  })
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
                                  setFormData({
                                    ...formData,
                                    pph_dasar: e.target.value as
                                      "item" | "total",
                                  })
                                }
                              >
                                <option value="item">
                                  Item yang dicentang
                                </option>
                                <option value="total">Seluruh nilai</option>
                              </select>
                            </div>
                          </div>

                          <p className="text-muted fs-6 mb-0 mt-2">
                            {pphPerItem ? (
                              <>
                                Centang kolom <strong>PPh</strong> di tabel item
                                untuk memilih item yang dikenakan.
                              </>
                            ) : (
                              <>
                                PPh dikenakan atas seluruh nilai, jadi centang
                                per item di tabel tidak berlaku.
                              </>
                            )}
                          </p>
                        </div>
                      )}

                      <table className="table table-sm mb-0">
                        <tbody>
                          {/* Subtotal grup hanya ditampilkan di sini kalau
                              kepalanya tidak ada di atas — supaya angka yang
                              sama tidak muncul dua kali di satu layar. */}
                          {pilihan &&
                            formData.grup.map((g, gi) => (
                              <tr key={gi}>
                                <td className="text-muted">
                                  {g.nama || `Grup ${gi + 1}`}
                                </td>
                                <td align="right" className="fw-bold">
                                  {uang(subtotalGrup(g), formData.currency)}
                                </td>
                              </tr>
                            ))}

                          {!pilihan && (
                            <>
                              {/* SELURUH baris ditampilkan, termasuk yang masih
                                  nol. Ini panel kerja, bukan dokumen cetak:
                                  baris yang muncul-hilang mengikuti isian
                                  membuat angkanya sulit dicocokkan, dan yang
                                  tarifnya belum diisi tidak pernah tahu barisnya
                                  ada. Di PDF sebaliknya — baris bernilai nol
                                  memang tidak dicetak. */}
                              <tr>
                                <td className="text-muted">Subtotal</td>
                                <td align="right">
                                  {uang(subtotal, formData.currency)}
                                </td>
                              </tr>
                              <tr
                                className={diskonPersen > 0 ? "" : "text-muted"}
                              >
                                <td className="text-muted">
                                  Diskon ({diskonPersen}%)
                                </td>
                                <td align="right">
                                  {diskonNominal > 0 ? "- " : ""}
                                  {uang(diskonNominal, formData.currency)}
                                </td>
                              </tr>
                              <tr className={ppnPersen > 0 ? "" : "text-muted"}>
                                <td className="text-muted">
                                  PPN ({ppnPersen}%)
                                </td>
                                <td align="right">
                                  {uang(ppnNominal, formData.currency)}
                                </td>
                              </tr>
                              <tr
                                className={pphNominal > 0 ? "" : "text-muted"}
                              >
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
                            </>
                          )}
                        </tbody>
                      </table>

                      <p className="text-muted fs-6 mt-2 mb-0">
                        Angka di atas pratinjau. Nilai final dihitung server
                        saat disimpan.
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
