"use client";

import Alert from "@/components/Alert";
import { AccessProps, QuotationProps } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteQuotation } from "../_libs/action";
import { tautanPdf, uang } from "../_libs/skema";

/**
 * Detail quotation + aksi atas satu penawaran.
 *
 * Tidak memakai `components/Modal` karena Modal selalu membungkus isinya dalam
 * `<form>` dengan tombol simpan — di sini tidak ada yang disimpan, yang ada
 * tombol aksi.
 *
 * ## Tanpa alur status
 *
 * Penawaran di sini tidak punya siklus hidup: tidak ada "kirim ke customer",
 * "setujui", "tolak", atau "batalkan". Yang ada cuma dokumennya — dibuat,
 * diubah, dicetak, dihapus. Penawaran dikirim lewat email atau WhatsApp di luar
 * aplikasi ini, dan status yang harus dipelihara tangan selalu berakhir bohong:
 * tidak ada yang kembali ke sini untuk menandai "sudah dikirim".
 *
 * Satu-satunya keadaan yang masih dilacak adalah yang bisa dihitung sendiri
 * oleh sistem tanpa ada yang perlu mengisinya — masa berlaku yang sudah lewat.
 *
 * ## Kenapa EDIT dan HAPUS juga ada di sini
 *
 * Keduanya sudah ada di menu titik-tiga halaman list, dan itu memang tempat
 * yang benar untuk kerja borongan. Tapi alur yang sebenarnya dipakai bukan
 * begitu: user membuka detail untuk MEMERIKSA penawarannya dulu, baru
 * memutuskan. Tanpa tombol di sini ia harus menutup modal, mencari kembali
 * barisnya di daftar yang mungkin sudah berpindah halaman, lalu membuka menu
 * titik-tiga — semuanya setelah keputusannya bulat.
 */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Dipanggil setelah penawaran dihapus, supaya list ikut segar. */
  onChanged: () => void;
  data: QuotationProps;
  accessMenu: AccessProps;
  /** Halaman daftar yang sedang dibuka, ikut dibawa ke form edit. */
  halaman: number;
};

const tanggal = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Tanggal + jam, untuk stempel waktu sistem (`created_at`).
 *
 * Jamnya ikut karena beberapa penawaran untuk customer yang sama sering dibuat
 * di hari yang sama — tanggal saja tidak memisahkan "yang tadi pagi" dari
 * "yang barusan".
 */
const waktu = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function QuotationDetail(props: Props) {
  const { isOpen, onClose, onChanged, data, accessMenu, halaman } = props;
  const { push } = useRouter();

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const jalankan = async (
    aksi: () => Promise<{ status: boolean; message: string }>,
    konfirmasi: string,
  ) => {
    if (!confirm(konfirmasi)) return;

    setIsLoading(true);
    try {
      const result = await aksi();
      if (result.status) {
        setAlertModal({
          status: true,
          color: "success",
          message: "Success",
          subMessage: result.message,
        });
        onChanged();
        setTimeout(() => onClose(), 900);
      } else {
        setAlertModal({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      setAlertModal({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
      setIsLoading(false);
    }
  };

  const bolehEdit = accessMenu.update;
  const bolehHapus = accessMenu.delete;

  /**
   * Satu-satunya keadaan penawaran yang masih dilacak: masa berlakunya lewat.
   *
   * `data.kadaluarsa` dari backend, yang membandingkan `berlaku_sampai` dengan
   * tanggal server. Sengaja BUKAN dihitung ulang di sini dari `new Date()`:
   * jam browser bisa salah atau berbeda zona waktu, dan penawaran yang
   * ditandai kedaluwarsa sehari lebih cepat membuat orang membatalkan tawaran
   * yang sebenarnya masih sah.
   */
  const lewatTanggal = data.kadaluarsa;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        tabIndex={-1}
        role="dialog"
        style={{ display: "block" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-xl"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {data.nomor}
                {/* Dua penanda, dua warna, dan sengaja berbeda: REV itu
                    keterangan (dokumen ini revisi ke berapa), LEWAT MASA
                    BERLAKU itu peringatan. Menyamakan warnanya membuat yang
                    kedua tenggelam di antara dokumen yang banyak revisinya. */}
                {data.revisi > 0 && (
                  <span className="badge badge-dark light ms-2">
                    REV {data.revisi}
                  </span>
                )}
                {lewatTanggal && (
                  <span className="badge badge-warning light ms-2">
                    LEWAT MASA BERLAKU
                  </span>
                )}
                {isLoading && (
                  <span className="spinner-border spinner-border-sm ms-2"></span>
                )}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            {alertModal.status && (
              <div className="px-4 pt-3">
                <Alert
                  color={alertModal.color}
                  message={alertModal.message}
                  subMessage={alertModal.subMessage}
                />
              </div>
            )}

            <div style={{ maxHeight: "76vh", overflowY: "auto" }}>
              <div className="modal-body">
                {/* Ditaruh PALING ATAS, bukan menempel pada baris "Berlaku
                    sampai" di tabel bawah. Tanggalnya sendiri sudah tertulis di
                    sana dan tetap terbaca sebagai tanggal biasa — yang perlu
                    diketahui lebih dulu bukan tanggalnya, melainkan bahwa
                    tanggal itu sudah lewat. */}
                {lewatTanggal && (
                  <div className="alert alert-warning solid py-2 px-3 mb-3">
                    <i className="fas fa-exclamation-triangle me-2" />
                    Penawaran ini sudah <strong>lewat masa berlaku</strong> (
                    {tanggal(data.berlaku_sampai)}). Perbarui tanggalnya lewat
                    EDIT, atau buat penawaran baru.
                  </div>
                )}

                {/* KAPAN-nya ikut disebut. "Revisi ke-2" saja tidak cukup untuk
                    yang sedang mencocokkan dengan berkas kiriman customer: yang
                    ditanyakan biasanya "ini revisi yang mana, yang saya terima
                    minggu lalu atau yang kemarin". Dipakai `created_at` — waktu
                    dokumen ini lahir, bukan `tanggal` yang boleh diketik bebas
                    dan sering diisi mundur.

                    Dokumen ASALNYA tidak disebut karena memang tidak direkam:
                    angka revisi diketik user, bukan tautan antar penawaran. */}
                {data.revisi > 0 && (
                  <div className="alert alert-info solid py-2 px-3 mb-3">
                    <i className="fas fa-code-branch me-2" />
                    Revisi ke-<strong>{data.revisi}</strong>
                    {data.created_at && <> · dibuat {waktu(data.created_at)}</>}
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <table className="table table-sm table-borderless mb-3">
                      <tbody>
                        <tr>
                          <td className="text-muted" style={{ width: "38%" }}>
                            Customer
                          </td>
                          <td>
                            <strong>{data.customer.nama_customer}</strong>
                            <div className="text-muted fs-6">
                              {data.customer.kode}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Alamat</td>
                          <td>{data.customer.alamat || "-"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Attention</td>
                          <td>{data.attn || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-6">
                    <table className="table table-sm table-borderless mb-3">
                      <tbody>
                        <tr>
                          <td className="text-muted" style={{ width: "38%" }}>
                            Tanggal
                          </td>
                          <td>{tanggal(data.tanggal)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Berlaku sampai</td>
                          <td>{tanggal(data.berlaku_sampai)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Perihal</td>
                          <td>{data.perihal || "-"}</td>
                        </tr>
                        {/* Stempel waktu sistem. Inilah yang menjawab "revisi
                            ini dibuat kapan" untuk dokumen revisi — `tanggal`
                            di atas tanggal penawaran yang diketik user, bukan
                            waktu dokumennya lahir. */}
                        <tr>
                          <td className="text-muted">Dibuat</td>
                          <td>
                            {waktu(data.created_at)}
                            {data.nama_pembuat ? ` · ${data.nama_pembuat}` : ""}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {(data.grup ?? []).map((g, gi) => {
                  // Nomor item berjalan terus lintas grup, sama seperti di PDF,
                  // dan baris JUDUL tidak ikut bernomor — juga sama seperti di
                  // PDF. Karena itu yang dihitung cuma baris non-judul.
                  const mulaiNomor = (data.grup ?? [])
                    .slice(0, gi)
                    .reduce(
                      (t, x) => t + x.item.filter((b) => !b.judul).length,
                      0,
                    );

                  // Nomor berjalan di dalam grup ini; dinaikkan hanya saat
                  // barisnya memang barang.
                  let nomor = mulaiNomor;

                  return (
                    <div key={gi} className="mb-3">
                      {(data.grup ?? []).length > 1 && (
                        <div className="d-flex justify-content-between fw-bold mb-1">
                          <span>{g.nama}</span>
                          <span>{uang(g.subtotal ?? 0, data.currency)}</span>
                        </div>
                      )}
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: "1%" }}>NO</th>
                              <th>ITEM</th>
                              <th style={{ width: "8%" }}>QTY</th>
                              <th style={{ width: "11%" }}>SATUAN</th>
                              <th style={{ width: "15%" }}>HARGA</th>
                              <th style={{ width: "7%" }}>DISC</th>
                              <th style={{ width: "6%" }}>PPh</th>
                              <th style={{ width: "16%" }}>JUMLAH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.item.map((item, index) => {
                              // Baris judul: melintang, tanpa nomor dan tanpa
                              // kolom angka — persis seperti di PDF, supaya
                              // yang dilihat di layar sama dengan yang dicetak.
                              if (item.judul) {
                                return (
                                  <tr key={index} className="table-light">
                                    <td colSpan={8}>
                                      <strong
                                        style={{ whiteSpace: "pre-wrap" }}
                                      >
                                        {item.deskripsi}
                                      </strong>
                                    </td>
                                  </tr>
                                );
                              }

                              nomor += 1;

                              return (
                                <tr key={index}>
                                  <td align="center">{nomor}</td>
                                  <td style={{ whiteSpace: "pre-wrap" }}>
                                    {item.deskripsi}
                                    {(item.gambar ?? []).length > 0 && (
                                      <div className="d-flex flex-wrap gap-2 mt-2">
                                        {(item.gambar ?? []).map((gb) => (
                                          <a
                                            key={gb.uuid}
                                            href={`/api/sales/quotation/gambar/${gb.uuid}`}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src={`/api/sales/quotation/gambar/${gb.uuid}`}
                                              alt={gb.nama_asli}
                                              title={gb.nama_asli}
                                              style={{
                                                width: 52,
                                                height: 52,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                                border:
                                                  "1px solid var(--ems-tepi-input)",
                                              }}
                                            />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td align="center">{item.qty}</td>
                                  <td align="center">{item.satuan || "-"}</td>
                                  <td align="right">
                                    {uang(Number(item.harga), data.currency)}
                                  </td>
                                  <td align="center">
                                    {Number(item.diskon_persen) > 0
                                      ? `${item.diskon_persen}%`
                                      : "-"}
                                  </td>
                                  <td align="center">
                                    {item.kena_pph ? (
                                      <i className="fas fa-check text-success" />
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td align="right">
                                    {uang(item.jumlah ?? 0, data.currency)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                <div className="row">
                  <div className="col-md-7">
                    {data.syarat_pembayaran && (
                      <>
                        <h6 className="mb-1">Syarat &amp; Ketentuan</h6>
                        <p
                          className="text-muted"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {data.syarat_pembayaran}
                        </p>
                      </>
                    )}
                    {data.catatan && (
                      <>
                        <h6 className="mb-1">Catatan</h6>
                        <p
                          className="text-muted"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {data.catatan}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="col-md-5">
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted">Subtotal</td>
                          <td align="right">
                            {uang(data.subtotal, data.currency)}
                          </td>
                        </tr>
                        {data.diskon_persen > 0 && (
                          <>
                            <tr>
                              <td className="text-muted">
                                Diskon ({data.diskon_persen}%)
                              </td>
                              <td align="right">
                                - {uang(data.diskon_nominal, data.currency)}
                              </td>
                            </tr>
                          </>
                        )}
                        {data.ppn_persen > 0 && (
                          <tr>
                            <td className="text-muted">
                              PPN ({data.ppn_persen}%)
                            </td>
                            <td align="right">
                              {uang(data.ppn_nominal, data.currency)}
                            </td>
                          </tr>
                        )}
                        {data.pph_nominal > 0 && (
                          <tr>
                            <td className="text-muted">
                              PPh ({data.pph_persen}%
                              {data.pph_dasar === "item"
                                ? ", item tertentu"
                                : ""}
                              )
                            </td>
                            <td align="right">
                              - {uang(data.pph_nominal, data.currency)}
                            </td>
                          </tr>
                        )}
                        {/* Namanya tetap GRAND TOTAL apa pun isinya. Dulu
                            berganti jadi "DIBAYAR" begitu ada PPh — satu baris
                            yang sama dengan dua nama, tergantung isian, dan
                            cuma menyulitkan orang mencocokkannya dengan PDF. */}
                        <tr className="fw-bold border-top">
                          <td>GRAND TOTAL</td>
                          <td align="right">
                            {uang(data.total, data.currency)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-footer flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                >
                  CLOSE
                </button>

                {/* `btn-primary` — hijau, sama dengan tombol ADD di halaman
                    daftar. Ini aksi yang paling sering ditekan di modal, jadi
                    ia memakai warna aksi utama aplikasi.

                    Dua percobaan sebelumnya salah dan keduanya karena alasan
                    yang sama — menebak warna alih-alih membacanya:
                    `btn-info` ternyata MAGENTA (#D653C1) di template WorkLoad,
                    bukan biru muda seperti Bootstrap asli; `btn-danger` benar
                    secara konvensi PDF tapi di layar terbaca sebagai tombol
                    hapus. Cek nilainya di `style.css` sebelum memilih varian
                    warna di sini. */}
                <a
                  className="btn btn-primary"
                  href={tautanPdf(data.nomor)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fas fa-file-pdf me-2" />
                  LIHAT PDF
                </a>

                {bolehEdit && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={isLoading}
                    onClick={() =>
                      push(
                        `/sales/quotation/edit?id=${data.id}&page=${halaman}`,
                      )
                    }
                  >
                    <i className="fas fa-pencil-alt me-2" />
                    EDIT
                  </button>
                )}

                {/* Merah solid lagi, sejak LIHAT PDF pindah ke hijau: merahnya
                    tidak lagi diperebutkan, jadi satu-satunya aksi yang tidak
                    bisa dibatalkan di sini boleh memakainya sendirian. Yang
                    menjaganya tetap konfirmasi yang menyebut nomor dokumennya,
                    bukan sekadar "Yakin?" yang sama saja dengan tidak ada. */}
                {bolehHapus && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={isLoading}
                    onClick={() =>
                      jalankan(
                        () => deleteQuotation(data.id),
                        `Hapus ${data.nomor}? Tindakan ini tidak bisa dibatalkan.`,
                      )
                    }
                  >
                    <i className="fa fa-trash me-2" />
                    HAPUS
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
