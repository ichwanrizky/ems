"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { FilterTahun } from "@/libs/FilterTahun";
import { AccessProps, isLoadingProps, PoKeluarProps } from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  deletePoKeluar,
  getPoKeluar,
  getPoKeluarId,
  getTahun,
  PoKeluarFilterProps,
} from "../_libs/action";
import { tautanPdf, uang } from "../_libs/skema";
import PoKeluarDetail from "./PoKeluarDetail";

type Props = {
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
 * Dipasang di `<div>` DI DALAM sel, bukan di `<td>`-nya: tabelnya ber-layout
 * auto, dan di situ browser mengabaikan `max-width` pada sel.
 */
const lipat = (maxWidth: number): React.CSSProperties => ({
  maxWidth,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
});

export default function PoKeluarView({ accessMenu, halamanAwal }: Props) {
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

  const [filter, setFilter] = useState<PoKeluarFilterProps>({
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

  const [poData, setPoData] = useState([] as PoKeluarProps[]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [poTerpilih, setPoTerpilih] = useState<PoKeluarProps | null>(null);

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
   */
  useEffect(() => {
    const url =
      currentPage > 1
        ? `/sales/po-keluar?page=${currentPage}`
        : "/sales/po-keluar";

    window.history.replaceState(null, "", url);
  }, [currentPage]);

  /**
   * Hasil simpan dari form, dititipkan lewat sessionStorage.
   *
   * Bukan lewat query string: pesannya bukan bagian dari alamat halaman ini,
   * dan URL yang menyimpan "berhasil disimpan" akan mengulang banner itu tiap
   * kali ditautkan atau disegarkan. sessionStorage sekali baca lalu dibuang.
   */
  useEffect(() => {
    try {
      const titipan = sessionStorage.getItem("po-keluar:hasil");
      if (!titipan) return;

      sessionStorage.removeItem("po-keluar:hasil");

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
    filterAktif: PoKeluarFilterProps,
    page: number,
  ) => {
    setLoadingPage(true);
    try {
      const daftar = await getPoKeluar(
        search,
        filterAktif,
        page,
        ITEM_PER_PAGE,
      );

      if (daftar.status) {
        setPoData(daftar.data);
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
      const result = await getPoKeluarId(id);
      if (result.status) {
        setPoTerpilih(result.data);
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
              placeholder="Cari nomor / supplier / perihal"
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
                  push(`/sales/po-keluar/create?page=${currentPage}`)
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
                    <th style={{ width: "17%" }}>NOMOR</th>
                    <th style={{ width: "10%" }}>TANGGAL</th>
                    <th>SUPPLIER</th>
                    <th style={{ width: "18%" }}>PERIHAL</th>
                    <th style={{ width: "14%" }}>TOTAL</th>
                    <th style={{ width: "11%" }}>KIRIM</th>
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
                  ) : poData.length > 0 ? (
                    poData.map((item, index) => (
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
                                          `/sales/po-keluar/edit?id=${item.id}&page=${currentPage}`,
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
                                          () => deletePoKeluar(item.id),
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
                          {/* Lencana di BARIS SENDIRI di bawah nomor, bukan
                              menempel di sebelahnya: nomor PO sudah panjang
                              (`PJ-PO-SMS-26-0001`), dan lencana yang menyambung
                              di belakangnya melebarkan kolom hanya untuk baris
                              yang kebetulan punya revisi. */}
                          {item.revisi > 0 && (
                            <div>
                              <span className="badge badge-dark light">
                                REV {item.revisi}
                              </span>
                            </div>
                          )}
                        </td>
                        <td align="center">{item.tanggal}</td>
                        <td align="left">
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
                        {/* DILIPAT, bukan dipotong elipsis: perihal itu yang
                            dibaca orang saat mencari PO di daftar ini, dan
                            separuh kalimat yang diakhiri "…" memaksa buka detail
                            satu per satu. */}
                        <td align="left">
                          <div style={lipat(260)}>{item.perihal}</div>
                        </td>
                        <td align="right">{uang(item.total, item.currency)}</td>
                        <td align="center">
                          {item.tanggal_kirim ?? (
                            <span className="text-muted">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))
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

      {isDetailOpen && poTerpilih && (
        <PoKeluarDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setPoTerpilih(null);
          }}
          onChanged={segarkan}
          data={poTerpilih}
          accessMenu={accessMenu}
          halaman={currentPage}
        />
      )}
    </>
  );
}
