"use client";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import {
  AccessDepartmentProps,
  AccessProps,
  GajiProps,
  isLoadingProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import GajiCreate from "./GajiCreate";
import {
  deleteGaji,
  exportExcelGaji,
  ExportGajiProps,
  getGaji,
} from "../_libs/action";
import * as XLSX from "xlsx";

type GajiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function GajiView(props: GajiViewProps) {
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
  const [filter, setFilter] = useState({
    department:
      accessDepartment[0].department.id?.toString() || ("" as string | number),
    bulan: (new Date().getMonth() + 1) as number | string,
    tahun: new Date().getFullYear() as number | string,
  });

  const [gajiData, setGajiData] = useState([] as GajiProps[]);

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
      const result = await getGaji(search, filter);
      if (result.status) {
        setGajiData(result.data);
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
        const result = await deleteGaji(id);
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

  const exportToExcel = async (
    search: string,
    filter: {
      department: string | number;
      tahun: string | number;
      bulan: string | number;
    }
  ) => {
    if (confirm("Export Excel this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [0]: true });
      try {
        const result = await exportExcelGaji(search, filter);
        if (result.status) {
          const res = result.data as ExportGajiProps;

          const headers = res.listKomponen;
          const data = res.listGaji;

          const headerTitles = [
            "NO",
            "NAMA",
            "POSITION",
            "DEPARTMENT",
            "SUB DEPARTMENT",
            "STATUS NIKAH",
            "REKENING",
            ...headers.map((item) => item.komponen),
            "TOTAL SALARY",
          ];

          const exportData = data.map((item, index: number) => {
            const komponenValues = headers.reduce((acc: any, header: any) => {
              const komponenItem = item.gaji.find(
                (item2) => item2.komponen_id === header.id
              );
              if (komponenItem) {
                acc[header.komponen] =
                  komponenItem.tipe === "penambahan" ||
                  komponenItem.tipe === "pengurangan"
                    ? Number(komponenItem.nominal)
                    : komponenItem.nominal?.toString();
              } else {
                acc[header.komponen] = "INVALID DATA";
              }
              return acc;
            }, {});

            return {
              NO: index + 1,
              NAMA: item.nama?.toUpperCase(),
              POSITION: item.position?.toUpperCase(),
              DEPARTMENT: item.department.nama_department?.toUpperCase(),
              "SUB DEPARTMENT":
                item.sub_department.nama_sub_department?.toUpperCase(),
              "STATUS NIKAH": item.status_nikah?.toUpperCase(),
              REKENING: item.no_rek?.toUpperCase(),
              ...komponenValues,
              "TOTAL SALARY": item.gaji.reduce((acc: number, item2) => {
                const nominal = Number(item2.nominal);
                if (item2.tipe === "penambahan") {
                  return acc + nominal;
                } else if (item2.tipe === "pengurangan") {
                  return acc - nominal;
                } else {
                  return acc;
                }
              }, 0),
            };
          });

          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.aoa_to_sheet([headerTitles]);
          XLSX.utils.sheet_add_json(worksheet, exportData, {
            skipHeader: true,
            origin: "A2",
          });
          const colWidths = headerTitles.map((title, index) => {
            const maxContentWidth = Math.max(
              ...exportData.map((row: any) =>
                row[title] ? row[title].toString().length : 0
              )
            );
            return { wch: Math.max(title.length, maxContentWidth) };
          });
          worksheet["!cols"] = colWidths;
          XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
          XLSX.writeFile(
            workbook,
            `DATA GAJI ${filter.bulan}-${filter.tahun}.xlsx`
          );
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
        setIsLoadingAction({ ...isLoadingAction, [0]: false });
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
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
              value={filter.bulan}
            >
              <FilterBulan />
            </select>
            <select
              className="form-select me-2"
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              value={filter.tahun}
            >
              <FilterTahun />
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

            {gajiData.length > 0 &&
              (isLoadingAction[0] ? (
                <button type="button" className="btn btn-success" disabled>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  LOADING ...
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => exportToExcel(debouncedSearchTerm, filter)}
                >
                  EXPORT EXCEL
                </button>
              ))}
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
                    <th style={{ width: "15%" }}>NOMINAL</th>
                    <th style={{ width: "15%" }}>SLIP GAJI</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={5} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : gajiData.length > 0 ? (
                    gajiData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">
                          <Button
                            type="actionTable2"
                            indexData={index}
                            isLoading={isLoadingAction[item.id]}
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
                        <td align="right">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.nominal)}
                        </td>
                        <td align="center">
                          {
                            // slip gaji
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} align="center">
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
        <GajiCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData("", filter);
          }}
          departmentData={accessDepartment}
        />
      )}
    </>
  );
}
