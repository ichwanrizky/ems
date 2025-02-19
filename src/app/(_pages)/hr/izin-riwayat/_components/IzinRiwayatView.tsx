"use client";
import {
  AccessDepartmentProps,
  AccessProps,
  isLoadingProps,
  RiwayatIzinProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import { deleteRiwayatIzin, getRiwayatIzin } from "../_libs/action";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { DisplayFullDate } from "@/libs/DisplayDate";
import Pagination from "@/components/Pagination";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import IzinRiwayatCreate from "./IzinRiwayatCreate";

type Props = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function IzinRiwayatView(props: Props) {
  const { accessDepartment, accessMenu } = props;

  const [currentPage, setCurrentPage] = useState(1 as number);
  const [totalData, setTotalData] = useState(0 as number);

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
    bulan: (new Date().getMonth() + 1) as number | string,
    tahun: new Date().getFullYear() as number | string,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [riwayatIzinData, setRiwayatIzinData] = useState(
    [] as RiwayatIzinProps[]
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
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(debouncedSearchTerm, filter, currentPage);
  }, [debouncedSearchTerm, filter, currentPage]);

  const fetchData = async (
    search: string,
    filter: {
      department: string | number;
      bulan: number | string;
      tahun: number | string;
    },
    currentPage: number
  ) => {
    setLoadingPage(true);
    try {
      const result = await getRiwayatIzin(search, filter, currentPage);
      if (result.status) {
        setRiwayatIzinData(result.data);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteRiwayatIzin(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData("", filter, 1);
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

  const maxPagination = 5;
  const itemPerPage = 10;
  const totalPage = Math.ceil(totalData / itemPerPage);

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

            <select
              className="form-select me-2"
              value={filter.bulan}
              onChange={(e) =>
                setFilter({ ...filter, bulan: Number(e.target.value) })
              }
            >
              {FilterBulan()}
            </select>

            <select
              className="form-select me-2"
              value={filter.tahun}
              onChange={(e) =>
                setFilter({ ...filter, tahun: Number(e.target.value) })
              }
            >
              {FilterTahun()}
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
                    <th>NAMA</th>
                    <th style={{ width: "10%" }}>JENIS</th>
                    <th style={{ width: "15%" }}>TANGGAL</th>
                    <th style={{ width: "5%" }}>JUM. HARI</th>
                    <th style={{ width: "5%" }}>JUM. JAM</th>
                    <th style={{ width: "5%" }}>MC</th>
                    <th style={{ width: "18%" }}>KET.</th>
                    <th style={{ width: "10%" }}>APPROVAL</th>
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
                  ) : riwayatIzinData.length > 0 ? (
                    riwayatIzinData.map((item, index) => (
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
                        <td align="center">{item.number}</td>
                        <td>{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="center">
                          {item.jenis_izin.jenis?.toUpperCase()}
                        </td>
                        <td align="center">
                          {new Date(item.tanggal)
                            .toLocaleString("id-ID", DisplayFullDate)
                            .replaceAll(".", ":")}
                        </td>
                        <td align="center">{item.jumlah_hari}</td>
                        <td align="center">{item.jumlah_jam}</td>
                        <td align="center">
                          {item.jenis_izin.kode === "S" && (
                            <a href={`/izin/${item.uuid}.png`} target="_blank">
                              MC
                            </a>
                          )}
                        </td>
                        <td>{item.keterangan?.toUpperCase()}</td>
                        <td align="center">
                          {item.status === 1 ? (
                            <span className="badge bg-success">
                              Approved By
                            </span>
                          ) : (
                            <span className="badge bg-danger">Rejected By</span>
                          )}
                          <br />
                          {item.user_approved.name?.toUpperCase()}
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
                totalPage={totalPage}
                maxPagination={maxPagination}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <IzinRiwayatCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData("", filter, 1);
          }}
          departmentData={accessDepartment}
        />
      )}
    </>
  );
}
