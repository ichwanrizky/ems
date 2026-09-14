"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { AccessProps, CustomerProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import {
  deleteCustomer,
  getCustomer,
  getCustomerId,
} from "../_libs/action";
import CustomerCreate from "./CustomerCreate";
import CustomerEdit from "./CustomerEdit";

type CustomerViewProps = {
  accessMenu: AccessProps;
};

const ITEM_PER_PAGE = 10;

export default function CustomerView(props: CustomerViewProps) {
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

  const [customerData, setCustomerData] = useState([] as CustomerProps[]);
  const [customerEdit, setCustomerEdit] = useState({} as CustomerProps);

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
      const result = await getCustomer(search, page, ITEM_PER_PAGE);
      if (result.status) {
        setCustomerData(result.data);
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
      const result = await getCustomerId(id);
      if (result.status) {
        setCustomerEdit(result.data as CustomerProps);
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
        const result = await deleteCustomer(id);
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

          <div className="customer-table">
            <div className="table-responsive white-space-nowrap">
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th style={{ width: "10%" }}>KODE</th>
                    <th>NAMA CUSTOMER</th>
                    <th style={{ width: "24%" }}>ALAMAT</th>
                    <th style={{ width: "15%" }}>EMAIL</th>
                    <th style={{ width: "12%" }}>TELP</th>
                    {/* Tiga hitungan terpisah, bukan satu "dokumen": satu baris
                        customer bisa berperan dua arah — yang kita tagih lewat
                        Quotation, dan yang kita bayar lewat PO Keluar, karena
                        PO Keluar memang mengambil pemasoknya dari master ini.
                        Menjumlahkannya jadi satu angka menyembunyikan perbedaan
                        itu justru di tempat yang paling butuh membedakannya. */}
                    <th style={{ width: "7%" }}>QUO</th>
                    <th style={{ width: "7%" }}>PO MSK</th>
                    <th style={{ width: "7%" }}>PO KLR</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={10} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : customerData.length > 0 ? (
                    customerData.map((item, index) => (
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
                        <td align="center">{item.kode}</td>
                        <td align="left">{item.nama_customer}</td>
                        <td align="left" className="text-wrap">
                          {item.alamat || "-"}
                        </td>
                        <td align="left">{item.email || "-"}</td>
                        <td align="left">{item.telp || "-"}</td>
                        <td align="center">
                          <span className="badge badge-primary light">
                            {item.jumlah_quotation ?? 0}
                          </span>
                        </td>
                        <td align="center">
                          <span className="badge badge-dark light">
                            {item.jumlah_po_masuk ?? 0}
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
                      <td colSpan={10} align="center">
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
        <CustomerCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData(debouncedSearchTerm, currentPage);
          }}
        />
      )}

      {isEditOpen && (
        <CustomerEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchData(debouncedSearchTerm, currentPage);
          }}
          customerEdit={customerEdit}
        />
      )}
    </>
  );
}
