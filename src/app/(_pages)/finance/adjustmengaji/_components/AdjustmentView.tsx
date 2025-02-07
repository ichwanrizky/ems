"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  AccessDepartmentProps,
  AccessProps,
  AdjustmentProps,
  isLoadingProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import AdjustmentCreate from "./AdjustmentCreate";
import {
  deleteAdjustment,
  getAdjustment,
  getAdjustmentId,
} from "../_libs/action";
import Pagination from "@/components/Pagination";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import AdjustmentEdit from "./AdjustmentEdit";

type AdjustmentViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function AdjustmentView(props: AdjustmentViewProps) {
  const { accessDepartment, accessMenu } = props;

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filter, setFilter] = useState({
    department:
      accessDepartment[0].department.id?.toString() || ("" as string | number),
    bulan: (new Date().getMonth() + 1) as number | string,
    tahun: new Date().getFullYear() as number | string,
  });

  const [adjustmentData, setAdjustmentData] = useState([] as AdjustmentProps[]);
  const [adjustmentEdit, setAdjustmentEdit] = useState({} as AdjustmentProps);

  useEffect(() => {
    if (alertPage.status) {
      const timer = setTimeout(() => {
        setAlertPage({
          status: false,
          color: "",
          message: "",
          subMessage: "",
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alertPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(debouncedSearchTerm, filter);
  }, [debouncedSearchTerm, filter]);

  const fetchData = async (
    search: string,
    filter: {
      department: string | number;
      tahun: string | number;
      bulan: string | number;
    }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getAdjustment(search, filter);
      if (result.status) {
        setAdjustmentData(result.data);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getAdjustmentId(id);
      if (result.status) {
        setAdjustmentEdit(result.data as AdjustmentProps);
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
        const result = await deleteAdjustment(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData("", filter);
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
              onChange={handleSearch}
            />
            <span className="material-icons-outlined position-absolute ms-3 translate-middle-y start-0 top-50 fs-5">
              search
            </span>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select me-2"
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
              value={filter.department}
            >
              <option value="">-- DEPT --</option>
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>
            <select
              className="form-select me-2"
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              value={filter.tahun}
            >
              <FilterTahun />
            </select>
            <select
              className="form-select me-2"
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
              value={filter.bulan}
            >
              <FilterBulan />
            </select>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto"></div>

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
                    <th>NAMA</th>
                    <th style={{ width: "15%" }}>JENIS</th>
                    <th style={{ width: "30%" }}>KETERANGAN</th>
                    <th style={{ width: "15%" }}>NOMINAL</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={6} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : adjustmentData.length > 0 ? (
                    adjustmentData.map((item, index) => (
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
                              if (accessMenu.update) {
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
                        <td align="center">{index + 1}</td>
                        <td align="left">{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="center">{item.jenis?.toUpperCase()}</td>
                        <td align="left">{item.keterangan?.toUpperCase()}</td>
                        <td align="right">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.nominal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} align="center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination
                currentPage={1}
                maxPagination={1}
                totalPage={1}
                setCurrentPage={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <AdjustmentCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData("", filter);
          }}
          departmentData={accessDepartment}
        />
      )}

      {isEditOpen && (
        <AdjustmentEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchData("", filter);
          }}
          departmentData={accessDepartment}
          adjustmentEdit={adjustmentEdit}
        />
      )}
    </>
  );
}
