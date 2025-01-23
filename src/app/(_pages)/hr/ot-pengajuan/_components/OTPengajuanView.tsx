"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import {
  AccessDepartmentProps,
  AccessProps,
  AccessSubDepartmentProps,
  isLoadingProps,
  PengajuanOvertimeProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import OTPengajuanCreate from "./OTPengajuanCreate";
import {
  approvalPengajuanOt,
  deletePengajuanOt,
  getPengajuanOt,
} from "../_libs/action";
import { DisplayFullDate, DisplayHour } from "@/libs/DisplayDate";

type Props = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
  accessSubDepartment: AccessSubDepartmentProps;
};

export default function OTPengajuanView(props: Props) {
  const { accessDepartment, accessMenu, accessSubDepartment } = props;

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

  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id?.toString() || "",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [pengajuanOTData, setPengajuanOTData] = useState(
    [] as PengajuanOvertimeProps[]
  );

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
    search = "",
    filter = {
      department: "",
    }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getPengajuanOt(search, filter);
      if (result.status) {
        setPengajuanOTData(result.data);
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

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deletePengajuanOt(id);
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

  const handleApproval = async (id: number, status: number) => {
    if (confirm("Update this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await approvalPengajuanOt(id, status);
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
              onChange={(e) => {
                setFilter({ ...filter, department: e.target.value });
              }}
              value={filter.department}
            >
              <option value="">-- DEPT --</option>
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
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
                    <th style={{ width: "10%" }}>SUB DEPT.</th>
                    <th>NAMA</th>
                    <th style={{ width: "15%" }}>TANGGAL</th>
                    <th style={{ width: "5%" }}>JAM</th>
                    <th style={{ width: "10%" }}>JOB DESK</th>
                    <th style={{ width: "10%" }}>REMARK</th>
                    <th style={{ width: "10%" }}>APPROVAL</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={9} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : pengajuanOTData.length > 0 ? (
                    pengajuanOTData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">
                          <Button
                            type="actionTable2"
                            indexData={index}
                            isLoading={isLoadingAction[item.id]}
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
                        <td align="center">{index + 1}</td>
                        <td align="center">
                          {item.sub_department.nama_sub_department?.toUpperCase()}
                        </td>
                        <td align="left">
                          {item.pengajuan_overtime_pegawai.map((e) => (
                            <React.Fragment key={e.pegawai.id}>
                              * {e.pegawai.nama}
                              <br />
                            </React.Fragment>
                          ))}
                        </td>
                        <td align="center" className="text-nowrap">
                          {new Date(item.tanggal)
                            .toLocaleString("id-ID", DisplayFullDate)
                            .replaceAll(".", ":")}
                        </td>
                        <td align="center" className="text-nowrap">
                          {new Date(item.jam_from)
                            .toLocaleString("id-ID", DisplayHour)
                            .replaceAll(".", ":")}
                          <br />
                          {new Date(item.jam_to)
                            .toLocaleString("id-ID", DisplayHour)
                            .replaceAll(".", ":")}
                        </td>
                        <td align="left">{item.job_desc?.toUpperCase()}</td>
                        <td align="left">{item.remark?.toUpperCase()}</td>
                        <td align="center">
                          {accessMenu.update &&
                            item.approval &&
                            (isLoadingAction[item.id] ? (
                              <div className="d-grid gap-2">
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                LOADING ...
                              </div>
                            ) : (
                              <div className="d-grid gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  type="button"
                                  onClick={() => handleApproval(item.id, 1)}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => handleApproval(item.id, 2)}
                                >
                                  Reject
                                </button>
                              </div>
                            ))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} align="center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={1}
                totalPage={1}
                maxPagination={1}
                setCurrentPage={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <OTPengajuanCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData("", filter);
          }}
          departmentData={accessDepartment}
          subDepartmentData={accessSubDepartment}
        />
      )}
    </>
  );
}
