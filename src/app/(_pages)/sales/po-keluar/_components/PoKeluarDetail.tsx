"use client";

import Alert from "@/components/Alert";
import { AccessProps, PoKeluarProps } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePoKeluar } from "../_libs/action";
import { tautanPdf, uang } from "../_libs/skema";

/**
 * Detail PO keluar + aksi atas satu dokumen.
 *
 * Tidak memakai `components/Modal` karena Modal selalu membungkus isinya dalam
 * `<form>` dengan tombol simpan — di sini tidak ada yang disimpan, yang ada
 * tombol aksi.
 *
 * ## Kenapa EDIT dan HAPUS juga ada di sini
 *
 * Keduanya sudah ada di menu titik-tiga halaman list, dan itu memang tempat
 * yang benar untuk kerja borongan. Tapi alur yang sebenarnya dipakai bukan
 * begitu: user membuka detail untuk MEMERIKSA PO-nya dulu, baru memutuskan.
 * Tanpa tombol di sini ia harus menutup modal, mencari kembali barisnya di
 * daftar yang mungkin sudah berpindah halaman, lalu membuka menu titik-tiga —
 * semuanya setelah keputusannya bulat.
 */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Dipanggil setelah PO dihapus, supaya list ikut segar. */
  onChanged: () => void;
  data: PoKeluarProps;
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
 * Jamnya ikut karena beberapa PO untuk supplier yang sama sering dibuat di hari
 * yang sama — tanggal saja tidak memisahkan "yang tadi pagi" dari "yang
 * barusan".
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

export default function PoKeluarDetail(props: Props) {
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

  // Nomor item berjalan dan baris JUDUL tidak ikut bernomor — sama seperti di
  // PDF, supaya yang dilihat di layar sama dengan yang dicetak.
  let nomor = 0;

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
                {data.revisi > 0 && (
                  <span className="badge badge-dark light ms-2">
                    REV {data.revisi}
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
                {/* KAPAN-nya ikut disebut. "Revisi ke-2" saja tidak cukup untuk
                    yang sedang mencocokkan dengan berkas kiriman supplier.
                    Dipakai `created_at` — waktu dokumen ini lahir, bukan
                    `tanggal` yang boleh diketik bebas dan sering diisi mundur. */}
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
                            Supplier
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
                            Tanggal PO
                          </td>
                          <td>{tanggal(data.tanggal)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Tanggal kirim</td>
                          <td>{tanggal(data.tanggal_kirim)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Perihal</td>
                          <td>{data.perihal || "-"}</td>
                        </tr>
                        {/* Stempel waktu sistem. Inilah yang menjawab "revisi
                            ini dibuat kapan" untuk dokumen revisi — `tanggal` di
                            atas tanggal PO yang diketik user, bukan waktu
                            dokumennya lahir. */}
                        <tr>
                          <td className="text-muted">Dibuat</td>
                          <td>
                            {waktu(data.created_at)}
                            {data.nama_pembuat ? ` · ${data.nama_pembuat}` : ""}
                          </td>
                        </tr>
                        {/* Ditampilkan walau kosong, bukan disembunyikan:
                            "tidak ada tanda tangan" itu keterangan yang perlu
                            dibaca sebelum dokumennya dikirim, dan baris yang
                            hilang terbaca seolah fiturnya tidak ada. */}
                        <tr>
                          <td className="text-muted">Tanda tangan</td>
                          <td>
                            {data.ttd ? (
                              <span className="d-inline-flex align-items-center gap-2">
                                {data.ttd.uuid && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={`/api/sales/ttd/gambar/${data.ttd.uuid}`}
                                    alt={`Tanda tangan ${data.ttd.nama ?? ""}`}
                                    style={{ maxHeight: 34 }}
                                  />
                                )}
                                <span>
                                  {data.ttd.nama}
                                  {data.ttd.jabatan
                                    ? ` · ${data.ttd.jabatan}`
                                    : ""}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted">
                                Tanpa tanda tangan — diteken manual
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "1%" }}>NO</th>
                        <th>ITEM</th>
                        <th style={{ width: "8%" }}>QTY</th>
                        <th style={{ width: "9%" }}>SATUAN</th>
                        <th style={{ width: "13%" }}>REMARKS</th>
                        <th style={{ width: "14%" }}>HARGA</th>
                        <th style={{ width: "6%" }}>DISC</th>
                        <th style={{ width: "6%" }}>PPh</th>
                        <th style={{ width: "14%" }}>JUMLAH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.item ?? []).map((item, index) => {
                        // Baris judul: melintang, tanpa nomor dan tanpa kolom
                        // angka — persis seperti di PDF.
                        if (item.judul) {
                          return (
                            <tr key={index} className="table-light">
                              <td colSpan={9}>
                                <strong style={{ whiteSpace: "pre-wrap" }}>
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
                            </td>
                            <td align="center">{item.qty}</td>
                            <td align="center">{item.satuan || "-"}</td>
                            <td align="center">{item.remarks || "-"}</td>
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
                          <tr>
                            <td className="text-muted">
                              Diskon ({data.diskon_persen}%)
                            </td>
                            <td align="right">
                              - {uang(data.diskon_nominal, data.currency)}
                            </td>
                          </tr>
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
                        <tr className="fw-bold border-top">
                          <td>GRAND TOTAL</td>
                          <td align="right">{uang(data.total, data.currency)}</td>
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
                    daftar dan sama dengan LIHAT PDF di detail quotation. Ini
                    aksi yang paling sering ditekan di modal.

                    Jangan menebak warna varian di template ini: `btn-info`
                    ternyata MAGENTA (#D653C1) di WorkLoad, bukan biru muda
                    seperti Bootstrap asli. Cek nilainya di `style.css` dulu. */}
                <a
                  className="btn btn-primary"
                  href={tautanPdf(data.nomor)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fas fa-file-pdf me-2" />
                  LIHAT PDF
                </a>

                {accessMenu.update && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={isLoading}
                    onClick={() =>
                      push(`/sales/po-keluar/edit?id=${data.id}&page=${halaman}`)
                    }
                  >
                    <i className="fas fa-pencil-alt me-2" />
                    EDIT
                  </button>
                )}

                {accessMenu.delete && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={isLoading}
                    onClick={() =>
                      jalankan(
                        () => deletePoKeluar(data.id),
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
