"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { AccessProps, isLoadingProps, TtdProps } from "@/types";
import React, { useEffect, useState } from "react";
import { deleteTtd, getTtd, getTtdId } from "../_libs/action";
import TtdCreate from "./TtdCreate";
import TtdEdit from "./TtdEdit";

type TtdViewProps = {
  accessMenu: AccessProps;
};

const ITEM_PER_PAGE = 10;

export default function TtdView(props: TtdViewProps) {
  const { accessMenu } = props;

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [ttdData, setTtdData] = useState([] as TtdProps[]);
  const [ttdEdit, setTtdEdit] = useState({} as TtdProps);

  useEffect(() => {
    if (alertPage.status) {
      const timer = setTimeout(() => {
        setAlertPage({ status: false, color: "", message: "", subMessage: "" });
      }, 2000);

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
    fetchData(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  const fetchData = async (search: string, page: number) => {
    setLoadingPage(true);
    try {
      const result = await getTtd(search, page, ITEM_PER_PAGE);
      if (result.status) {
        setTtdData(result.data);
        setTotalData(result.total_data);
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
      setLoadingPage(false);
    }
  };

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getTtdId(id);
      if (result.status) {
        setTtdEdit(result.data as TtdProps);
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

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteTtd(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData(debouncedSearchTerm, currentPage);
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
    }

    return;
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
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search position-absolute ms-3 translate-middle-y start-0 top-50 fs-5" />
          </div>
        </div>

        <div className="col-auto flex-grow-1 overflow-auto"></div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button type="createTable" onClick={() => setIsCreateOpen(true)} />
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

          <div className="ttd-table">
            <div className="table-responsive white-space-nowrap">
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th>NAMA</th>
                    <th style={{ width: "25%" }}>JABATAN</th>
                    <th style={{ width: "22%" }}>TANDA TANGAN</th>
                    {/* Dua hitungan terpisah: tanda tangan bisa dipakai dokumen
                        yang kita tagih (quotation) dan yang kita bayar (PO
                        keluar). Angka inilah yang membuat backend menolak
                        penghapusan, jadi ia harus terlihat sebelum tombolnya
                        ditekan — bukan muncul sebagai pesan galat sesudahnya. */}
                    <th style={{ width: "8%" }}>QUO</th>
                    <th style={{ width: "8%" }}>PO KLR</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={7} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : ttdData.length > 0 ? (
                    ttdData.map((item, index) => (
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
                                handleDelete(item.id);
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
                        <td align="left">{item.nama}</td>
                        <td align="left">{item.jabatan || "-"}</td>
                        <td align="center">
                          {item.uuid ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/sales/ttd/gambar/${item.uuid}`}
                              alt={`Tanda tangan ${item.nama}`}
                              style={{ maxHeight: 44, maxWidth: "100%" }}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td align="center">
                          <span className="badge badge-primary light">
                            {item.jumlah_quotation ?? 0}
                          </span>
                        </td>
                        <td align="center">
                          <span className="badge badge-warning light">
                            {item.jumlah_po_keluar ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} align="center">
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
        <TtdCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData(debouncedSearchTerm, currentPage);
          }}
        />
      )}

      {isEditOpen && (
        <TtdEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchData(debouncedSearchTerm, currentPage);
          }}
          ttdEdit={ttdEdit}
        />
      )}
    </>
  );
}
