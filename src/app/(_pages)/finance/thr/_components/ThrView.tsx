"use client";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import FilterSection from "@/components/FilterSection";
import Pagination from "@/components/Pagination";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import { AccessDepartmentProps, AccessProps, isLoadingProps, ThrProps } from "@/types";
import React, { useEffect, useState } from "react";
import { deleteThr, getThr } from "../_libs/action";
import * as XLSX from "xlsx";

type Props = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function ThrView(props: Props) {
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
  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id?.toString() || ("" as string | number),
    bulan: (new Date().getMonth() + 1) as number | string,
    tahun: new Date().getFullYear() as number | string,
  });

  const [thrData, setThrData] = useState([] as ThrProps[]);

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
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(debouncedSearchTerm, filter);
  }, [debouncedSearchTerm, filter]);

  const fetchData = async (
    search: string,
    filter: { department: string | number; tahun: string | number; bulan: string | number }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getThr(search, filter);
      if (result.status) {
        setThrData(result.data);
      } else {
        setAlertPage({ status: true, color: "danger", message: "Failed", subMessage: result.message });
      }
    } catch {
      setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteThr(id);
        if (result.status) {
          setAlertPage({ status: true, color: "success", message: "Success", subMessage: result.message });
          fetchData("", filter);
        } else {
          setAlertPage({ status: true, color: "danger", message: "Failed", subMessage: result.message });
        }
      } catch {
        setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
      } finally {
        setIsLoadingAction({ ...isLoadingAction, [id]: false });
      }
    }
    return;
  };

  const exportToExcel = async () => {
    if (confirm("Export Excel this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [0]: true });
      try {
        const headerTitles = ["NO", "NAMA", "THR", "PPH21", "NET THR"];
        const data = thrData.map((item, index) => ({
          NO: index + 1,
          NAMA: item.pegawai.nama?.toUpperCase(),
          THR: item.thr,
          PPH21: item.pph21,
          "NET THR": item.net_thr,
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headerTitles]);
        XLSX.utils.sheet_add_json(worksheet, data, { skipHeader: true, origin: "A2" });
        const colWidths = headerTitles.map((title) => {
          const maxContentWidth = Math.max(...data.map((row: any) => (row[title] ? row[title].toString().length : 0)));
          return { wch: Math.max(title.length, maxContentWidth) };
        });
        worksheet["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `DATA THR ${filter.bulan}-${filter.tahun}.xlsx`);
      } catch {
        setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
      } finally {
        setIsLoadingAction({ ...isLoadingAction, [0]: false });
      }
    }
    return;
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

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
            <span className="material-icons-outlined position-absolute ms-3 translate-middle-y start-0 top-50 fs-5">
              search
            </span>
          </div>
        </div>

        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <FilterSection
              options={accessDepartment?.map((item) => ({
                value: item.department.id,
                label: item.department.nama_department,
              }))}
              value={filter.department}
              onChange={(val) => setFilter({ ...filter, department: val })}
            />
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

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {thrData.length > 0 &&
              (isLoadingAction[0] ? (
                <button type="button" className="btn btn-success" disabled>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  LOADING ...
                </button>
              ) : (
                <button type="button" className="btn btn-success" onClick={exportToExcel}>
                  EXPORT EXCEL
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          {alertPage.status && (
            <Alert color={alertPage.color} message={alertPage.message} subMessage={alertPage.subMessage} />
          )}

          <div className="customer-table">
            <div className="table-responsive white-space-nowrap">
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th>NAMA</th>
                    <th style={{ width: "15%" }}>THR</th>
                    <th style={{ width: "15%" }}>PPH21</th>
                    <th style={{ width: "15%" }}>NET THR</th>
                    <th style={{ width: "10%" }}>SLIP THR</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={7} align="center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : thrData.length > 0 ? (
                    thrData.map((item, index) => (
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
                                setAlertPage({ status: true, color: "danger", message: "You don't have access to delete", subMessage: "" });
                              }
                            }}
                          >
                            <i className="bi bi-three-dots" />
                          </Button>
                        </td>
                        <td align="center">{index + 1}</td>
                        <td>{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="right">{formatRupiah(item.thr)}</td>
                        <td align="right">{formatRupiah(item.pph21)}</td>
                        <td align="right">{formatRupiah(item.net_thr)}</td>
                        <td align="center">
                          <a
                            href={`/slipthr/${item.uuid}`}
                            target="_blank"
                            className="btn btn-success btn-sm"
                          >
                            <i className="bi bi-file-earmark-pdf"></i> SLIP THR
                          </a>
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
              <Pagination currentPage={1} totalPage={1} maxPagination={1} setCurrentPage={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
