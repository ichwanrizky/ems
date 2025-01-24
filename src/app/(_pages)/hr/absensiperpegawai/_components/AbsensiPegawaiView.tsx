"use client";
import { AccessDepartmentProps, AttendanceMonthlyProps } from "@/types";
import React, { useEffect, useState } from "react";
import { getAbsensiPerpegawai, getPegawaiAbsen } from "../_libs/action";
import Alert from "@/components/Alert";
import {
  DisplayDate,
  DisplayFullDate,
  DisplayHour,
  getDayInIndonesian,
} from "@/libs/DisplayDate";
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
  const [absensiData, setAbsensiData] = useState(
    [] as AttendanceMonthlyProps[]
  );
  console.log("🚀 ~ AbsensiPegawaiView ~ absensiData:", absensiData);

  useEffect(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      pegawai: "",
    }));
    setAbsensiData([]);
  }, [filter.department, filter.bulan, filter.tahun]);

  useEffect(() => {
    fetchDataPegawai(filter.department);
  }, [filter.department]);

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

  const fetchDataAbsen = async (
    bulan: number,
    tahun: number,
    pegawai: string | number
  ) => {
    if (pegawai === "") return;

    try {
      const data = {
        bulan: bulan,
        tahun: tahun,
        pegawai: pegawai,
      };

      const result = await getAbsensiPerpegawai(data);
      if (result.status) {
        setAbsensiData(result.data);
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

  let latePegawai = 0;

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
                setAbsensiData([]);
                setFilter({ ...filter, pegawai: e.target.value });
                fetchDataAbsen(filter.bulan, filter.tahun, e.target.value);
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
                    <th style={{ width: "10%" }}>TANGGAL</th>
                    <th style={{ width: "10%" }}>HARI</th>
                    <th style={{ width: "10%" }}>ABSEN MASUK</th>
                    <th style={{ width: "10%" }}>ABSEN PULANG</th>
                    <th style={{ width: "10%" }}>TERLAMBAT</th>
                    <th style={{ width: "15%" }}>IZIN</th>
                    <th style={{ width: "5%" }}>OT</th>
                    <th style={{ width: "5%" }}>OT TOTAL</th>
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
                  ) : absensiData.length > 0 ? (
                    absensiData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.nama?.toUpperCase()}</td>
                        <td align="center">
                          {new Date(item.tanggal)
                            .toLocaleString("id-ID", DisplayDate)
                            .replaceAll(".", ":")}{" "}
                        </td>
                        <td align="center">
                          {getDayInIndonesian(item.hari?.toString())}
                        </td>
                        <td align="center">{item.absen_masuk}</td>
                        <td align="center">{item.absen_pulang}</td>
                        <td align="center">
                          {item.tanggal_libur === null &&
                          item.tanggal_absen !== null &&
                          !item.izin?.some((e) =>
                            ["G2", "CS", "IS"].includes(
                              e.jenis_izin_kode?.toUpperCase()
                            )
                          )
                            ? item.late
                              ? (() => {
                                  latePegawai += item.late;
                                  return `${item.late} menit`;
                                })()
                              : ""
                            : ""}
                        </td>
                        <td align="left">
                          {item.izin?.map((e, index) => (
                            <React.Fragment key={index}>
                              {`* ${e.jenis_izin?.toUpperCase()}`}
                              <br />
                            </React.Fragment>
                          ))}
                        </td>
                        <td align="center">
                          {item.jam_ot ? `${item.jam_ot} jam` : ""}
                        </td>
                        <td align="center">{item.total_ot}</td>
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

                <tfoot>
                  <tr>
                    <td colSpan={6}></td>
                    <td align="center">{latePegawai}</td>
                  </tr>
                </tfoot>
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
