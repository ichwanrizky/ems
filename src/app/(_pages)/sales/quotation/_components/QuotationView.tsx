"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { FilterTahun } from "@/libs/FilterTahun";
import { AccessProps, isLoadingProps, QuotationProps } from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  deleteQuotation,
  getQuotation,
  getQuotationId,
  getTahun,
  QuotationFilterProps,
} from "../_libs/action";
import { tautanPdf, uang } from "../_libs/skema";
import QuotationDetail from "./QuotationDetail";

type QuotationViewProps = {
  accessMenu: AccessProps;
  /** Halaman awal dari URL (?page=), supaya kembali dari form tidak reset. */
  halamanAwal: number;
};

const ITEM_PER_PAGE = 10;

/**
 * Sel tabel yang isinya boleh MELIPAT ke baris berikutnya.
 *
 * Pembungkus tabel ini ber-`white-space-nowrap`, jadi teks panjang tidak pernah
 * turun baris — ia mendorong tabelnya melebar sampai kolom lain keluar layar.
 * Dua kolom terkena: PERIHAL (sampai 159 karakter, 232 baris di atas 60) dan
 * CUSTOMER (sampai 85 karakter, 217 baris di atas 45).
 *
 * Dipasang di `<div>` DI DALAM sel, bukan di `<td>`-nya: tabelnya ber-layout
 * auto, dan di situ browser mengabaikan `max-width` pada sel — dipasang di
 * `<td>` perbaikannya tidak bekerja sama sekali.
 *
 * `overflowWrap: anywhere` untuk kata yang tidak punya spasi sama sekali —
 * nomor part seperti `W415266410111-XCSTA-REV2` lebih panjang dari kolomnya dan
 * tanpa ini ia tetap menjebol lebar itu.
 */
const lipat = (maxWidth: number): React.CSSProperties => ({
  maxWidth,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
});

export default function QuotationView(props: QuotationViewProps) {
  const { accessMenu, halamanAwal } = props;

  const { push } = useRouter();

  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(halamanAwal);
  const [totalData, setTotalData] = useState(0);

  const [filter, setFilter] = useState<QuotationFilterProps>({
    // Tahun awal DIGANTI begitu daftar tahun dari backend tiba — lihat efek di
    // bawah. Nilai ini cuma pengisi sampai daftarnya sampai.
    tahun: new Date().getFullYear(),
  });

  /**
   * Tahun yang ADA datanya, dari backend.
   *
   * Dropdown-nya tidak boleh menebak rentang dari kalender. Data impor
   * `sistempanji` jauh lebih tua dari tahun berjalan, dan tahun yang tidak ada
   * di dropdown berarti barisnya tidak terjangkau sama sekali — bukan sekadar
   * tidak terlihat. PO masuk seluruhnya 2019–2020; dengan pilihan yang berhenti
   * di 2024, halamannya selalu kosong dan tidak ada cara menampilkannya.
   */
  const [tahunOpsi, setTahunOpsi] = useState<number[]>([]);

  /**
   * Daftar tahun sudah selesai diambil (berhasil maupun tidak).
   *
   * Pengambilan data DITAHAN sampai ini true. Tanpa penahan itu halamannya
   * mengambil data untuk tahun pengisi lebih dulu, lalu mengambil ulang begitu
   * tahun yang benar tiba — dan di antara keduanya user melihat kedipan
   * "No data available" untuk modul yang datanya bukan dari tahun berjalan.
   */
  const [tahunSiap, setTahunSiap] = useState(false);

  useEffect(() => {
    const ambil = async () => {
      try {
        const daftar = await getTahun();

        if (daftar.length === 0) return;

        setTahunOpsi(daftar);

        // Pindah ke tahun TERBARU yang ada datanya, bukan tahun berjalan. Untuk
        // modul yang datanya sampai hari ini keduanya sama dan tidak ada yang
        // berubah; untuk yang datanya berhenti beberapa tahun lalu, inilah yang
        // membuat halamannya tidak terbuka dalam keadaan kosong.
        //
        // Dijaga perbandingan supaya tidak memicu pengambilan data kedua saat
        // nilainya memang sudah sama.
        setFilter((s) =>
          Number(s.tahun) === daftar[0] ? s : { ...s, tahun: daftar[0] },
        );
      } finally {
        // Juga saat gagal: menahan selamanya berarti halamannya tidak pernah
        // memuat apa pun hanya karena satu endpoint pembantu tidak menjawab.
        setTahunSiap(true);
      }
    };

    ambil();
  }, []);

  const [quotationData, setQuotationData] = useState([] as QuotationProps[]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [quotationTerpilih, setQuotationTerpilih] =
    useState<QuotationProps | null>(null);

  useEffect(() => {
    if (alertPage.status) {
      const timer = setTimeout(() => {
        setAlertPage({ status: false, color: "", message: "", subMessage: "" });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [alertPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!tahunSiap) return;

    fetchData(debouncedSearchTerm, filter, currentPage);
  }, [tahunSiap, debouncedSearchTerm, filter, currentPage]);

  /**
   * Cerminkan halaman aktif ke URL supaya form bisa kembali ke sini.
   *
   * `replace`, bukan `push`: memberi satu entri riwayat per halaman membuat
   * tombol Back menyusuri pagination satu per satu, bukan keluar dari daftar.
   * `scroll: false` supaya layar tidak melompat ke atas tiap ganti halaman.
   */
  useEffect(() => {
    const url =
      currentPage > 1
        ? `/sales/quotation?page=${currentPage}`
        : "/sales/quotation";

    window.history.replaceState(null, "", url);
  }, [currentPage]);

  /**
   * Hasil simpan dari form, dititipkan lewat sessionStorage.
   *
   * Bukan lewat query string: pesannya bukan bagian dari alamat halaman ini,
   * dan URL yang menyimpan "berhasil disimpan" akan mengulang banner itu tiap
   * kali ditautkan atau disegarkan. sessionStorage sekali baca lalu dibuang.
   *
   * Dipakai karena banner di form sendiri praktis tidak pernah terlihat:
   * tombol simpan ada di dasar form yang panjang, sementara banner-nya di
   * puncak — user sudah berpindah halaman sebelum sempat menggulir ke atas.
   */
  useEffect(() => {
    try {
      const titipan = sessionStorage.getItem("quotation:hasil");
      if (!titipan) return;

      sessionStorage.removeItem("quotation:hasil");

      const { color, message, subMessage } = JSON.parse(titipan);
      setAlertPage({ status: true, color, message, subMessage });
    } catch {
      // sessionStorage bisa ditolak (private window, cookie diblokir) dan
      // isinya bisa saja bukan JSON. Banner yang hilang bukan alasan untuk
      // menggagalkan halaman daftarnya.
    }
  }, []);

  const fetchData = async (
    search: string,
    filterAktif: QuotationFilterProps,
    page: number,
  ) => {
    setLoadingPage(true);
    try {
      const daftar = await getQuotation(
        search,
        filterAktif,
        page,
        ITEM_PER_PAGE,
      );

      if (daftar.status) {
        setQuotationData(daftar.data);
        setTotalData(daftar.total_data);
      } else {
        setAlertPage({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: daftar.message,
        });
      }
    } catch (error) {
      setAlertPage({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
    } finally {
      setLoadingPage(false);
    }
  };

  const segarkan = () => fetchData(debouncedSearchTerm, filter, currentPage);

  const bukaDetail = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getQuotationId(id);
      if (result.status) {
        setQuotationTerpilih(result.data);
        setIsDetailOpen(true);
      } else {
        setAlertPage({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
      }
    } catch (error) {
      setAlertPage({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
    } finally {
      setIsLoadingAction({ ...isLoadingAction, [id]: false });
    }
  };

  const jalankanAksi = async (
    id: number,
    aksi: () => Promise<{ status: boolean; message: string }>,
    konfirmasi: string,
  ) => {
    if (!confirm(konfirmasi)) return;

    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await aksi();
      setAlertPage({
        status: true,
        color: result.status ? "success" : "danger",
        message: result.status ? "Success" : "Failed",
        subMessage: result.message,
      });
      if (result.status) segarkan();
    } catch (error) {
      setAlertPage({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
    } finally {
      setIsLoadingAction({ ...isLoadingAction, [id]: false });
    }
  };

  const totalPage = Math.max(1, Math.ceil(totalData / ITEM_PER_PAGE));

  return (
    <>
      <div className="row g-3">
        <div className="col-auto">
          <div className="position-relative">
            <input
              className="form-control px-5"
              type="search"
              placeholder="Cari nomor / customer / perihal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search position-absolute ms-3 translate-middle-y start-0 top-50 fs-5" />
          </div>
        </div>

        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select me-2"
              value={filter.tahun}
              onChange={(e) => {
                setFilter({ ...filter, tahun: e.target.value });
                setCurrentPage(1);
              }}
            >
              <FilterTahun daftar={tahunOpsi} semua />
            </select>
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button
                type="createTable"
                onClick={() =>
                  push(`/sales/quotation/create?page=${currentPage}`)
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          {alertPage.status && (
            <Alert
              color={alertPage.color}
              message={alertPage.message}
              subMessage={alertPage.subMessage}
            />
          )}

          <div className="customer-table">
            <div className="table-responsive white-space-nowrap">
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th style={{ width: "16%" }}>NOMOR</th>
                    <th style={{ width: "10%" }}>TANGGAL</th>
                    <th>CUSTOMER</th>
                    <th style={{ width: "18%" }}>PERIHAL</th>
                    <th style={{ width: "14%" }}>TOTAL</th>
                    <th style={{ width: "11%" }}>MASA BERLAKU</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={8} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : quotationData.length > 0 ? (
                    quotationData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td align="center">
                            {isLoadingAction[item.id] ? (
                              <button
                                className="btn btn-light btn-xs sharp"
                                type="button"
                                disabled
                              >
                                <span className="spinner-border spinner-border-sm" />
                              </button>
                            ) : (
                              <div className="dropdown">
                                <button
                                  id={`aksi-${index}`}
                                  className="btn btn-light btn-xs sharp"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  data-bs-display="static"
                                  aria-expanded="false"
                                >
                                  <i className="fas fa-ellipsis-h" />
                                </button>
                                <ul
                                  className="dropdown-menu"
                                  aria-labelledby={`aksi-${index}`}
                                  style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    zIndex: 1050,
                                  }}
                                >
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => bukaDetail(item.id)}
                                    >
                                      <i className="fas fa-eye text-primary me-2" />
                                      DETAIL
                                    </button>
                                  </li>
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      href={tautanPdf(item.nomor)}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <i className="fas fa-file-pdf text-danger me-2" />
                                      PDF
                                    </a>
                                  </li>
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => {
                                        if (accessMenu.update) {
                                          push(
                                            `/sales/quotation/edit?id=${item.id}&page=${currentPage}`,
                                          );
                                        } else {
                                          setAlertPage({
                                            status: true,
                                            color: "danger",
                                            message:
                                              "You don't have access to edit",
                                            subMessage: "",
                                          });
                                        }
                                      }}
                                    >
                                      <i className="fas fa-pencil-alt text-primary me-2" />
                                      EDIT
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item text-danger"
                                      onClick={() => {
                                        if (accessMenu.delete) {
                                          jalankanAksi(
                                            item.id,
                                            () => deleteQuotation(item.id),
                                            `Hapus ${item.nomor}?`,
                                          );
                                        } else {
                                          setAlertPage({
                                            status: true,
                                            color: "danger",
                                            message:
                                              "You don't have access to delete",
                                            subMessage: "",
                                          });
                                        }
                                      }}
                                    >
                                      <i className="fa fa-trash me-2" />
                                      DELETE
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </td>
                          <td align="center">{item.number}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-start"
                              onClick={() => bukaDetail(item.id)}
                            >
                              {item.nomor}
                            </button>
                            {/* Lencana, bukan teks redup seperti sebelumnya.
                                Revisi mengubah arti dokumennya — yang ini
                                menggantikan yang lama — jadi ia harus terbaca
                                saat memindai daftar, bukan baru ketahuan
                                setelah barisnya dibaca teliti.

                                Ditaruh di BARIS SENDIRI di bawah nomor, bukan
                                menempel di sebelahnya: nomor penawaran sudah
                                panjang (`PJ-Q-SCH-26-0707`), dan lencana yang
                                menyambung di belakangnya melebarkan kolom hanya
                                untuk baris yang kebetulan punya revisi. */}
                            {item.revisi > 0 && (
                              <div>
                                <span className="badge badge-dark light">
                                  REV {item.revisi}
                                </span>
                              </div>
                            )}
                          </td>
                          <td align="center">{item.tanggal}</td>
                          {/* Baris kedua berisi PIC, bukan kode customer.
                              Kodenya sudah ada di menu Customer dan tidak
                              menjawab apa pun yang ditanyakan di daftar ini —
                              yang dicari orang saat menelusuri penawaran adalah
                              "ini dulu ke siapa", bukan nomor internalnya. */}
                          <td align="left">
                            {/* Dilipat dengan alasan yang sama seperti kolom
                                PERIHAL di bawah: nama customer di data ini
                                mencapai 85 karakter ("PT BANK RAKYAT INDONESIA
                                (PERSERO) Tbk. KANTOR WILAYAH …"), dan 217 baris
                                lewat dari 45. Tanpa batas, kolom ini ikut
                                mendorong tabelnya melebar. */}
                            <div style={lipat(240)}>
                              {item.customer.nama_customer}
                            </div>
                            <div className="text-muted fs-6" style={lipat(240)}>
                              {item.attn ? (
                                <>
                                  <i className="fas fa-user me-1" />
                                  {item.attn}
                                </>
                              ) : (
                                <span className="fst-italic">tanpa PIC</span>
                              )}
                            </div>
                          </td>
                          {/* Dipotong dengan elipsis, dan lebarnya dikunci px.
                              Pembungkus tabel ini ber-`white-space-nowrap`,
                              jadi perihal panjang tidak pernah melipat — ia
                              melebarkan tabel sampai kolom lain terdorong
                              keluar layar. Perihal penawaran hasil impor
                              diturunkan dari uraian item dan bisa sampai 159
                              karakter, jadi ini bukan kasus langka.

                              DILIPAT, bukan dipotong elipsis: perihal itu yang
                              dibaca orang saat mencari penawaran di daftar ini,
                              dan separuh kalimat yang diakhiri "…" memaksa buka
                              detail satu per satu. Barisnya jadi lebih tinggi,
                              tapi isinya terbaca utuh. */}
                          <td align="left">
                            <div style={lipat(260)}>{item.perihal}</div>
                          </td>
                          <td align="right">
                            {uang(item.total, item.currency)}
                          </td>
                          <td align="center">
                            {item.kadaluarsa ? (
                              <span className="badge badge-warning light">
                                LEWAT MASA BERLAKU
                              </span>
                            ) : (
                              <span className="text-muted">&mdash;</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} align="center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                maxPagination={5}
                totalPage={totalPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {isDetailOpen && quotationTerpilih && (
        <QuotationDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setQuotationTerpilih(null);
          }}
          onChanged={segarkan}
          data={quotationTerpilih}
          accessMenu={accessMenu}
          halaman={currentPage}
        />
      )}
    </>
  );
}
