"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { uang } from "@/libs/Dokumen";
import { FilterTahun } from "@/libs/FilterTahun";
import { AccessProps, isLoadingProps, PoMasukProps } from "@/types";
import React, { useEffect, useState } from "react";
import {
  deletePoMasuk,
  getPoMasuk,
  getPoMasukId,
  getTahun,
  PoMasukFilterProps,
} from "../_libs/action";
import { ikonBerkas, tautanBerkas } from "../_libs/skema";
import PoMasukCreate from "./PoMasukCreate";
import PoMasukEdit from "./PoMasukEdit";

type Props = {
  accessMenu: AccessProps;
};

const ITEM_PER_PAGE = 10;

/**
 * Sel tabel yang isinya boleh MELIPAT ke baris berikutnya.
 *
 * Pembungkus tabel ini ber-`white-space-nowrap`, jadi teks panjang tidak pernah
 * turun baris — ia mendorong tabelnya melebar sampai kolom lain keluar layar.
 * Alasan dan cara pasangnya sama dengan `QuotationView`: dipasang di `<div>` DI
 * DALAM sel, bukan di `<td>`-nya, karena tabelnya ber-layout auto dan di situ
 * browser mengabaikan `max-width` pada sel.
 */
const lipat = (maxWidth: number): React.CSSProperties => ({
  maxWidth,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
});

export default function PoMasukView({ accessMenu }: Props) {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [filter, setFilter] = useState<PoMasukFilterProps>({
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

  const [poData, setPoData] = useState([] as PoMasukProps[]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [poEdit, setPoEdit] = useState<PoMasukProps | null>(null);

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

  const fetchData = async (
    search: string,
    filterAktif: PoMasukFilterProps,
    page: number,
  ) => {
    setLoadingPage(true);
    try {
      const daftar = await getPoMasuk(search, filterAktif, page, ITEM_PER_PAGE);

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

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getPoMasukId(id);
      if (result.status && result.data) {
        setPoEdit(result.data);
        setIsEditOpen(true);
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

  const handleDelete = async (item: PoMasukProps) => {
    if (
      !confirm(`Hapus PO ${item.nomor}? Tindakan ini tidak bisa dibatalkan.`)
    ) {
      return;
    }

    setIsLoadingAction({ ...isLoadingAction, [item.id]: true });
    try {
      const result = await deletePoMasuk(item.id);
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
      setIsLoadingAction({ ...isLoadingAction, [item.id]: false });
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
                onClick={() => setIsCreateOpen(true)}
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
                    <th style={{ width: "14%" }}>NOMOR PO</th>
                    <th style={{ width: "10%" }}>TANGGAL</th>
                    <th>CUSTOMER</th>
                    <th style={{ width: "16%" }}>PERIHAL</th>
                    <th style={{ width: "13%" }}>NILAI</th>
                    <th style={{ width: "18%" }}>BERKAS</th>
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
                          <Button
                            type="actionTable"
                            indexData={index}
                            isLoading={isLoadingAction[item.id]}
                            onEdit={() => {
                              if (accessMenu.update) {
                                handleGetEdit(item.id);
                              } else {
                                setAlertPage({
                                  status: true,
                                  color: "danger",
                                  message: "You don't have access to edit",
                                  subMessage: "",
                                });
                              }
                            }}
                            onDelete={() => {
                              if (accessMenu.delete) {
                                handleDelete(item);
                              } else {
                                setAlertPage({
                                  status: true,
                                  color: "danger",
                                  message: "You don't have access to delete",
                                  subMessage: "",
                                });
                              }
                            }}
                          >
                            <i className="bi bi-three-dots" />
                          </Button>
                        </td>
                        <td align="center">{item.number}</td>
                        <td>
                          <div style={lipat(160)}>{item.nomor}</div>
                          {/* Nomor penawaran yang dijawab, bukan sekadar
                              lencana "ada quotation": yang dicari orang di
                              daftar ini justru nomornya — untuk dicocokkan
                              dengan berkas penawaran yang mereka pegang. */}
                          {item.quotation ? (
                            <div className="text-muted fs-6">
                              <i className="fas fa-link me-1" />
                              {item.quotation.nomor}
                            </div>
                          ) : (
                            <div className="text-muted fs-6 fst-italic">
                              tanpa quotation
                            </div>
                          )}
                        </td>
                        <td align="center">{item.tanggal}</td>
                        <td align="left">
                          <div style={lipat(240)}>
                            {item.customer.nama_customer}
                          </div>
                          <div className="text-muted fs-6" style={lipat(240)}>
                            {item.requestor ? (
                              <>
                                <i className="fas fa-user me-1" />
                                {item.requestor}
                              </>
                            ) : (
                              <span className="fst-italic">
                                tanpa requestor
                              </span>
                            )}
                          </div>
                        </td>
                        <td align="left">
                          <div style={lipat(240)}>{item.perihal || "-"}</div>
                        </td>
                        <td align="right">
                          {/* NULL dan 0 dibedakan: "PO tanpa nominal" bukan
                              "PO senilai nol", dan menyamakan keduanya membuat
                              rate card terbaca sebagai pesanan gratis. */}
                          {item.nilai === null ? (
                            <span className="text-muted fst-italic fs-6">
                              tidak tercantum
                            </span>
                          ) : (
                            uang(item.nilai, item.currency)
                          )}
                        </td>
                        <td>
                          {item.berkas.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {item.berkas.map((b) => (
                                <a
                                  key={b.uuid}
                                  href={tautanBerkas(b.uuid)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-truncate"
                                  style={{ maxWidth: "16rem" }}
                                  title={b.nama_asli}
                                >
                                  <i className={`${ikonBerkas(b.tipe)} me-2`} />
                                  {b.nama_asli}
                                </a>
                              ))}
                            </div>
                          ) : (
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

      {isCreateOpen && (
        <PoMasukCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            segarkan();
          }}
        />
      )}

      {isEditOpen && poEdit && (
        <PoMasukEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setPoEdit(null);
            segarkan();
          }}
          poEdit={poEdit}
        />
      )}
    </>
  );
}
