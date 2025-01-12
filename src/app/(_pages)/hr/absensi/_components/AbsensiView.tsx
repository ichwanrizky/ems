"use client";
import {
  AbsenProps,
  AccessDepartmentProps,
  AccessSubDepartmentProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";
import { getAbsensi } from "../_libs/action";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { DisplayFullDate, DisplayHour } from "@/libs/DisplayDate";

type AbsensiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessSubDepartment: AccessSubDepartmentProps;
};

export default function AbsensiView(props: AbsensiViewProps) {
  const { accessDepartment, accessSubDepartment } = props;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setHours(currentDate.getHours() + 7);

  const [loadingPage, setLoadingPage] = useState(true);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    accessSubDepartment.filter(
      (e) =>
        e.sub_department.department_id === accessDepartment[0].department.id
    ) || ([] as AccessSubDepartmentProps)
  );
  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id || "",
    sub_department: "",
    status_absen: "",
    date: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [absensiData, setAbsensiData] = useState([] as AbsenProps[]);

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
    fetchData(filter, debouncedSearchTerm);
  }, [debouncedSearchTerm, filter]);

  const fetchData = async (
    filter = {
      department: "" as string | number,
      sub_department: "",
      status_absen: "",
      date: new Date(),
    },
    search = ""
  ) => {
    setLoadingPage(true);
    try {
      const result = await getAbsensi(filter, search);
      if (result.status) {
        setAbsensiData(result.data as AbsenProps[]);
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
            <DatePicker
              autoComplete="off"
              id="tanggal_absen"
              dropdownMode="select"
              wrapperClassName={styles.datePicker}
              className="form-select"
              selected={filter.date}
              onChange={(date: any) => setFilter({ ...filter, date: date })}
              scrollableYearDropdown
              dateFormat={"yyyy-MM-dd"}
              showMonthDropdown
              showYearDropdown
              onKeyDown={(e) => {
                e.preventDefault();
              }}
            />

            <select
              className="form-select me-2 ms-2"
              onChange={(e) => {
                setFilter({ ...filter, department: e.target.value });

                setSelectedSubDepartment([]);
                if (e.target.value) {
                  const subDepartments = accessSubDepartment.filter(
                    (item) =>
                      item.sub_department.department_id ===
                      Number(e.target.value)
                  );

                  setSelectedSubDepartment(
                    subDepartments as AccessSubDepartmentProps
                  );
                }
              }}
            >
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>

            <select
              className="form-select me-2"
              onChange={(e) => {
                setFilter({ ...filter, sub_department: e.target.value });
              }}
            >
              <option value="">-- SUB DEPT --</option>
              {selectedSubDepartment?.map((item, index: number) => (
                <option value={item.sub_department.id} key={index}>
                  {item.sub_department.nama_sub_department}
                </option>
              ))}
            </select>

            <select
              className="form-select me-2"
              onChange={(e) => {
                setFilter({ ...filter, status_absen: e.target.value });
              }}
            >
              <option value="">-- ALL ABSEN --</option>
              <option value="1">HADIR</option>
              <option value="0">TIDAK HADIR</option>
            </select>
          </div>
        </div>

        <div className="col-auto"></div>
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
                    <th style={{ width: "20%" }}>TANGGAL</th>
                    <th style={{ width: "10%" }}>ABSEN MASUK</th>
                    <th style={{ width: "10%" }}>ABSEN PULANG</th>
                    <th style={{ width: "8%" }}>TERLAMBAT</th>
                    <th style={{ width: "10%" }}>IZIN</th>
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
                  ) : absensiData.length > 0 ? (
                    absensiData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.nama?.toUpperCase()}</td>
                        <td align="center" className="text-nowrap">
                          {item.absen.length > 0 ? (
                            new Date(item.absen[0].tanggal)
                              .toLocaleString("id-ID", DisplayFullDate)
                              .replaceAll(".", ":")
                          ) : (
                            <span className="text-danger">
                              Menunggu Absensi
                            </span>
                          )}
                        </td>
                        <td align="center" className="text-nowrap">
                          {item.absen.length > 0
                            ? item.absen[0].absen_masuk !== null
                              ? new Date(item.absen[0].absen_masuk)
                                  .toLocaleString("id-ID", DisplayHour)
                                  .replaceAll(".", ":")
                              : "-"
                            : ""}
                        </td>
                        <td align="center" className="text-nowrap">
                          {item.absen.length > 0
                            ? item.absen[0].absen_pulang !== null
                              ? new Date(item.absen[0].absen_pulang)
                                  .toLocaleString("id-ID", DisplayHour)
                                  .replaceAll(".", ":")
                              : "-"
                            : ""}
                        </td>
                        <td align="center">{item.absen[0]?.late}</td>
                        <td></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} align="center">
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
