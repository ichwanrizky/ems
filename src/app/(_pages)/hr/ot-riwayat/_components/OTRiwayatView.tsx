"use client";
import {
  AccessDepartmentProps,
  AccessProps,
  AccessSubDepartmentProps,
  isLoadingProps,
  RiwayatOvertimeProps,
} from "@/types";
import FilterSection from "@/components/FilterSection";
import FilterDept from "@/components/FilterDept";
import React, { useEffect, useState } from "react";
import { deleteRiwayatOt, getRiwayatOt } from "../_libs/action";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { DisplayFullDate, DisplayHour } from "@/libs/DisplayDate";
import Pagination from "@/components/Pagination";
import { FilterTahun } from "@/libs/FilterTahun";
import { FilterBulan } from "@/libs/FilterBulan";

type Props = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
  accessSubDepartment: AccessSubDepartmentProps;
};

export default function OTRiwayatView(props: Props) {
  const { accessDepartment, accessMenu, accessSubDepartment } = props;

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
    sub_department: "" as string | number,
    tahun: new Date().getFullYear() as string | number,
    bulan: (new Date().getMonth() + 1) as string | number,
  });
  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    accessSubDepartment.filter(
      (item) =>
        item.sub_department.department_id === accessDepartment[0].department.id
    ) as AccessSubDepartmentProps
  );

  const [riwayatOTData, setRiwayatOTData] = useState(
    [] as RiwayatOvertimeProps[]
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
    fetchData(debouncedSearchTerm, filter, currentPage);
  }, [debouncedSearchTerm, filter, currentPage]);

  const fetchData = async (
    search: string,
    filter: {
      department: string | number;
      sub_department?: string | number;
      tahun: string | number;
      bulan: string | number;
    },
    currentPage?: number
  ) => {
    setLoadingPage(true);
    try {
      const result = await getRiwayatOt(search, filter, currentPage);
      if (result.status) {
        setRiwayatOTData(result.data);
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
        const result = await deleteRiwayatOt(id);
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
            <FilterSection
              options={accessDepartment?.map((item) => ({
                value: item.department.id,
                label: item.department.nama_department,
              }))}
              value={filter.department}
              onChange={(val) => {
                setFilter({ ...filter, department: val });
                setSelectedSubDepartment([]);
                if (val) {
                  const subDepartments = accessSubDepartment.filter(
                    (item) =>
                      item.sub_department.department_id === Number(val)
                  );
                  setSelectedSubDepartment(
                    subDepartments as AccessSubDepartmentProps
                  );
                }
              }}
            />

            <FilterDept
              options={selectedSubDepartment?.map((item) => ({
                value: item.sub_department.id,
                label: item.sub_department.nama_sub_department,
              }))}
              value={filter.sub_department}
              onChange={(val) => setFilter({ ...filter, sub_department: val })}
            />

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
                    <th style={{ width: "10%" }}>DEPT.</th>
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
                  ) : riwayatOTData.length > 0 ? (
                    riwayatOTData.map((item, index) => (
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
                        <td align="center">
                          {item.sub_department.nama_sub_department?.toUpperCase()}
                        </td>
                        <td align="left">
                          {item.pengajuan_overtime_pegawai.map((e) => (
                            <React.Fragment key={e.pegawai.id}>
                              * {e.pegawai.nama?.toUpperCase()}
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
                          {item.status === 1 ? (
                            <span className="badge bg-success">
                              Approved By
                            </span>
                          ) : (
                            <span className="badge bg-danger">Rejected By</span>
                          )}
                          <br />
                          {item.user.name?.toUpperCase()}
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
                currentPage={currentPage}
                totalPage={totalPage}
                maxPagination={maxPagination}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
