"use client";
import { AbsenProps, AccessDepartmentProps } from "@/types";
import React, { useEffect, useState } from "react";
import { getAbsensiPerpegawai, getPegawaiAbsen } from "../_libs/action";
import Alert from "@/components/Alert";
import { DisplayFullDate, DisplayHour } from "@/libs/DisplayDate";
import Pagination from "@/components/Pagination";

type AbsensiPegawaiViewProps = {
  accessDepartment: AccessDepartmentProps;
};
export default function AbsensiPegawaiView(props: AbsensiPegawaiViewProps) {
  const { accessDepartment } = props;

  const [loadingPage, setLoadingPage] = useState(true);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id || "",
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    pegawai: "" as string | number,
  });

  const [pegawaiData, setPegawaiData] = useState(
    [] as {
      id: number;
      nama: string;
    }[]
  );
  const [absensiData, setAbsensiData] = useState([] as AbsenProps[]);

  useEffect(() => {
    fetchDataPegawai(filter.department);
  }, [filter.department]);

  useEffect(() => {
    fetchDataAbsen(filter);
  }, [filter]);

  const fetchDataPegawai = async (department = "" as string | number) => {
    setLoadingPage(true);
    try {
      const result = await getPegawaiAbsen(department);
      if (result.status) {
        setPegawaiData(
          result.data as {
            id: number;
            nama: string;
          }[]
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
      setLoadingPage(false);
    }
  };

  const fetchDataAbsen = async (filter: {
    bulan: number;
    tahun: number;
    pegawai: string | number;
  }) => {
    if (filter.pegawai === "") return;
    try {
      const result = await getAbsensiPerpegawai(filter);
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
    }
  };

  return (
    <>
      <div className="row g-3">
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select me-2"
              onChange={(e) => {
                setFilter({ ...filter, department: e.target.value });
                setPegawaiData([]);
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
              value={filter.bulan}
              onChange={(e) =>
                setFilter({ ...filter, bulan: Number(e.target.value) })
              }
            >
              {Array.from({ length: 12 }, (_, i) => {
                const monthNames = [
                  "Januari",
                  "Februari",
                  "Maret",
                  "April",
                  "Mei",
                  "Juni",
                  "Juli",
                  "Augustus",
                  "September",
                  "Oktober",
                  "November",
                  "Desember",
                ];
                return (
                  <option value={i + 1} key={i}>
                    {monthNames[i]?.toUpperCase()}
                  </option>
                );
              })}
            </select>

            <select
              className="form-select me-2"
              value={filter.tahun}
              onChange={(e) =>
                setFilter({ ...filter, tahun: Number(e.target.value) })
              }
            >
              {Array.from({ length: 3 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return year >= 2024 ? (
                  <option value={year} key={i}>
                    {year}
                  </option>
                ) : null;
              })}
            </select>

            <select
              className="form-select me-2"
              value={filter.pegawai}
              onChange={(e) => {
                setFilter({ ...filter, pegawai: e.target.value });
              }}
            >
              <option value="">--SELECT--</option>
              {pegawaiData?.map((item, index: number) => (
                <option value={item.id} key={index}>
                  {item.nama?.toUpperCase()}
                </option>
              ))}
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
