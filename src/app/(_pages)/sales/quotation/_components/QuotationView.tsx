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
  duplikatQuotation,
  getQuotation,
  getQuotationId,
  QuotationFilterProps,
} from "../_libs/action";
import { tautanPdf } from "../_libs/skema";
import QuotationDetail from "./QuotationDetail";

type QuotationViewProps = {
  accessMenu: AccessProps;
};

const ITEM_PER_PAGE = 10;

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

export default function QuotationView(props: QuotationViewProps) {
  const { accessMenu } = props;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [filter, setFilter] = useState<QuotationFilterProps>({
    tahun: new Date().getFullYear(),
  });

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
    fetchData(debouncedSearchTerm, filter, currentPage);
  }, [debouncedSearchTerm, filter, currentPage]);

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
              <FilterTahun />
            </select>
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button
                type="createTable"
                onClick={() => push("/sales/quotation/create")}
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
                                            `/sales/quotation/edit?id=${item.id}`,
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
                                      className="dropdown-item"
                                      onClick={() => {
                                        if (accessMenu.insert) {
                                          jalankanAksi(
                                            item.id,
                                            () => duplikatQuotation(item.id),
                                            `Duplikat ${item.nomor} jadi penawaran baru?`,
                                          );
                                        } else {
                                          setAlertPage({
                                            status: true,
                                            color: "danger",
                                            message:
                                              "You don't have access to create",
                                            subMessage: "",
                                          });
                                        }
                                      }}
                                    >
                                      <i className="fas fa-copy text-info me-2" />
                                      DUPLIKAT
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
                                setelah barisnya dibaca teliti. */}
                            {item.revisi > 0 && (
                              <span className="badge badge-dark light ms-2">
                                REV {item.revisi}
                              </span>
                            )}
                            {item.nomor_induk && (
                              <div className="text-muted fs-6">
                                dari {item.nomor_induk}
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
                            {item.customer.nama_customer}
                            <div className="text-muted fs-6">
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
                          <td align="left">{item.perihal}</td>
                          <td align="right">{rupiah(item.total)}</td>
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
        />
      )}
    </>
  );
}
