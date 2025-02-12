"use client";

import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import { AccessDepartmentProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import { getPph } from "../_libs/action";
import * as XLSX from "xlsx";

type PphViewProps = {
  accessDepartment: AccessDepartmentProps;
};

export default function PphView(props: PphViewProps) {
  const { accessDepartment } = props;

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
    department:
      accessDepartment[0].department.id?.toString() || ("" as string | number),
    bulan: (new Date().getMonth() + 1) as number | string,
    tahun: new Date().getFullYear() as number | string,
  });

  const [pphData, setPphData] = useState(
    [] as {
      id: number;
      gaji: number;
      pph21: number;
      pegawai: {
        id: number;
        nama: string;
        npwp: string;
      };
    }[]
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
    search: string,
    filter: {
      department: string | number;
      tahun: string | number;
      bulan: string | number;
    }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getPph(search, filter);
      if (result.status) {
        setPphData(result.data);
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

  const exportToExcel = async () => {
    if (confirm("Export Excel this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [0]: true });
      try {
        const headerTitles = ["NO", "NAMA", "NPWP", "GAJI", "PPH21"];
        const data = pphData.map((item, index: number) => {
          return {
            NO: index + 1,
            NAMA: item.pegawai.nama?.toUpperCase(),
            NPWP: item.pegawai.npwp,
            GAJI: item.gaji,
            PPH21: item.pph21,
          };
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headerTitles]);
        XLSX.utils.sheet_add_json(worksheet, data, {
          skipHeader: true,
          origin: "A2",
        });
        const colWidths = headerTitles.map((title, index) => {
          const maxContentWidth = Math.max(
            ...data.map((row: any) =>
              row[title] ? row[title].toString().length : 0
            )
          );
          return { wch: Math.max(title.length, maxContentWidth) };
        });
        worksheet["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(
          workbook,
          `DATA PPH ${filter.bulan}-${filter.tahun}.xlsx`
        );
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
            {pphData.length > 0 &&
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
                  onClick={() => exportToExcel()}
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
                    <th style={{ width: "1%" }}>NO</th>
                    <th>NAMA</th>
                    <th style={{ width: "25%" }}>GAJI</th>
                    <th style={{ width: "25%" }}>PPH</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={4} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : pphData.length > 0 ? (
                    pphData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="right">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.gaji)}
                        </td>
                        <td align="right">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(item.pph21)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} align="center">
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
    </>
  );
}
