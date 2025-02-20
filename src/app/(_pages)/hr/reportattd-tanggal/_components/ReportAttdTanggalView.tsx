"use client";
import {
  AccessDepartmentProps,
  AccessProps,
  isLoadingProps,
  ReportAttdProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import { getReportAttdBulan } from "../_libs/action";
import { FilterTahun } from "@/libs/FilterTahun";
import { FilterBulan } from "@/libs/FilterBulan";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import * as XLSX from "xlsx";

type Props = {
  accessDepartment: AccessDepartmentProps;
};

export default function ReportAttdTanggalView(props: Props) {
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
    department: accessDepartment[0].department.id?.toString() || "",
    tahun: new Date().getFullYear() as string | number,
    bulan: (new Date().getMonth() + 1) as string | number,
  });

  const [reportData, setReportData] = useState([] as ReportAttdProps[]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

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
      const result = await getReportAttdBulan(search, filter);
      if (result.status) {
        setReportData(result.data);
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
        const headerTitles = [
          "NO",
          "NAMA",
          "HARI KERJA",
          "HADIR",
          "A",
          "C",
          "UL",
          "S",
          "GATEPASS",
          "TIDAK/LUPA ABSEN",
          "LATE",
        ];
        const data = reportData.map((item, index: number) => {
          return {
            NO: index + 1,
            NAMA: item.nama?.toUpperCase(),
            HARI_KERJA: item.workdate_count,
            HADIR: item.attend_count + item.attend_weekend_count,
            A: item.notattend_count,
            C: item.cuti_count + item.cuti_s_count,
            UL: item.izin_count + item.izin_s_count,
            S: item.sakit_count,
            GATEPASS: item.g1_count + item.g2_count + item.g3_count,
            TIDAK_LUPA_ABSEN: item.pm_count,
            LATE: item.late_count,
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
          `DATA REPORT ATTD ${filter.bulan}-${filter.tahun}.xlsx`
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
              onChange={(e) => {
                setFilter({ ...filter, tahun: e.target.value });
              }}
              value={filter.tahun}
            >
              <FilterTahun />
            </select>

            <select
              className="form-select me-2"
              onChange={(e) => {
                setFilter({ ...filter, bulan: e.target.value });
              }}
              value={filter.bulan}
            >
              <FilterBulan />
            </select>
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {reportData.length > 0 &&
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
                    <th style={{ width: "5%" }}>HARI KERJA</th>
                    <th style={{ width: "5%" }}>HADIR</th>
                    <th style={{ width: "5%" }}>A</th>
                    <th style={{ width: "5%" }}>C</th>
                    <th style={{ width: "5%" }}>UL</th>
                    <th style={{ width: "5%" }}>S</th>
                    <th style={{ width: "5%" }}>GATEPASS</th>
                    <th style={{ width: "5%" }}>TIDAK/LUPA ABSEN</th>
                    <th style={{ width: "5%" }}>LATE</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={11} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : reportData.length > 0 ? (
                    reportData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.nama?.toUpperCase()}</td>
                        <td align="center">{item.workdate_count}</td>
                        <td align="center">
                          {item.attend_count + item.attend_weekend_count}
                        </td>
                        <td align="center">{item.notattend_count}</td>
                        <td align="center">
                          {item.cuti_count + item.cuti_s_count}
                        </td>
                        <td align="center">
                          {item.izin_count + item.izin_s_count}
                        </td>
                        <td align="center">{item.sakit_count}</td>
                        <td align="center">
                          {item.g1_count + item.g2_count + item.g3_count}
                        </td>
                        <td align="center">{item.pm_count}</td>
                        <td align="center">{item.late_count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} align="center">
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
    </>
  );
}
