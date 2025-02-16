"use client";
import {
  AccessDepartmentProps,
  AccessProps,
  AttendanceMonthlyProps,
  isLoadingProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import {
  deleteAbsensiPerpegawai,
  getAbsensiPerpegawai,
  getPegawaiAbsen,
} from "../_libs/action";
import Alert from "@/components/Alert";
import { DisplayDate, getDayInIndonesian } from "@/libs/DisplayDate";
import Pagination from "@/components/Pagination";
import Button from "@/components/Button";
import AbsensiPegawaiCreate from "./AbsensiPegawaiCreate";
import AbsensiPegawaiEdit from "./AbsensiPegawaiEdit";
import Select from "react-select";
import { FilterTahun } from "@/libs/FilterTahun";
import { FilterBulan } from "@/libs/FilterBulan";

type AbsensiPegawaiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};
export default function AbsensiPegawaiView(props: AbsensiPegawaiViewProps) {
  const { accessDepartment, accessMenu } = props;

  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [pegawaiData, setPegawaiData] = useState(
    [] as {
      id: number;
      nama: string;
    }[]
  );
  const [absensiData, setAbsensiData] = useState(
    [] as AttendanceMonthlyProps[]
  );

  const [selectedAbsen, setSelectedAbsen] = useState({} as any);

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

  const handleCreateAbsen = (
    date: Date,
    pegawai: {
      id: number;
      nama: string;
    }
  ) => {
    setSelectedAbsen({
      date,
      pegawai,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteAbsensiPerpegawai(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchDataAbsen(filter.bulan, filter.tahun, filter.pegawai);
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

  const handleEditAbsen = (
    date: Date,
    pegawai: {
      id: number;
      nama: string;
    },
    absen?: {
      absen_id: number;
      absen_masuk: string;
      absen_pulang: string;
    }
  ) => {
    setSelectedAbsen({
      date,
      pegawai,
      absen,
    });
    setIsEditOpen(true);
  };

  let latePegawai = 0;
  let count_jam = 0;
  let count_total = 0;

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

            <Select
              instanceId={"pegawai"}
              placeholder="Select"
              styles={{
                control: (base) => ({
                  ...base,
                  minWidth: "200px",
                  height: "36px", // Set a fixed height for the select box
                  minHeight: "36px",
                }),
                menu: (base) => ({
                  ...base,
                  minWidth: "200px",
                  zIndex: 1000,
                  marginTop: "-60px", // Remove extra spacing above the dropdown
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (styles) => ({
                  ...styles,
                  color: "black",
                }),
              }}
              menuPortalTarget={document.body}
              options={pegawaiData?.map((e) => ({
                value: e.id,
                label: e.nama?.toUpperCase(),
              }))}
              onChange={(e: any) => {
                setAbsensiData([]);
                if (e) {
                  setFilter({ ...filter, pegawai: e.value });
                  fetchDataAbsen(filter.bulan, filter.tahun, e.value);
                } else {
                  setFilter({ ...filter, pegawai: "" });
                }
              }}
              value={
                filter.pegawai
                  ? pegawaiData
                      ?.map((e) => ({
                        value: e.id,
                        label: e.nama?.toUpperCase(),
                      }))
                      .find((option) => option.value === filter.pegawai)
                  : null
              }
              isClearable
              required
            />
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
            <div
              className="table-responsive white-space-nowrap"
              style={{ maxHeight: "35rem" }}
            >
              <table
                className="table align-middle table-striped table-hover table-bordered"
                style={{ position: "relative" }}
              >
                <thead
                  className="table-light"
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
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
                            .replaceAll(".", ":")}
                          <br />
                          {item.absen_id === null ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm mt-2"
                              onClick={() => {
                                if (accessMenu.update) {
                                  handleCreateAbsen(item.tanggal, {
                                    id: item.id,
                                    nama: item.nama,
                                  });
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
                              CREATE
                            </button>
                          ) : (
                            <>
                              <div className="mt-2"></div>
                              <Button
                                type="actionTable"
                                indexData={index}
                                onEdit={() => {
                                  if (accessMenu.update) {
                                    handleEditAbsen(
                                      item.tanggal,
                                      {
                                        id: item.id,
                                        nama: item.nama,
                                      },
                                      {
                                        absen_id: item.absen_id,
                                        absen_masuk: item.absen_masuk,
                                        absen_pulang: item.absen_pulang,
                                      }
                                    );
                                  } else {
                                    setAlertPage({
                                      status: true,
                                      color: "danger",
                                      message:
                                        "You don't have access to delete",
                                      subMessage: "",
                                    });
                                  }
                                }}
                                onDelete={() => {
                                  if (accessMenu.delete) {
                                    handleDelete(item.absen_id);
                                  } else {
                                    setAlertPage({
                                      status: true,
                                      color: "danger",
                                      message:
                                        "You don't have access to delete",
                                      subMessage: "",
                                    });
                                  }
                                }}
                              >
                                <i className="bi bi-three-dots" />
                              </Button>
                            </>
                          )}
                        </td>
                        <td
                          align="center"
                          style={{
                            color: item.tanggal_libur !== null ? "red" : "",
                          }}
                        >
                          {getDayInIndonesian(item.tanggal)}
                        </td>
                        <td align="center">{item.absen_masuk}</td>
                        <td align="center">{item.absen_pulang}</td>
                        <td align="center">
                          {item.tanggal_libur === null
                            ? item.tanggal_absen !== null &&
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
                              : ""
                            : item.late
                            ? (() => {
                                latePegawai += item.late;
                                return `${item.late} menit`;
                              })()
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
                          {(() => {
                            count_jam += Number(item.jam_ot);
                            return item.jam_ot ? `${item.jam_ot} jam` : "";
                          })()}
                        </td>
                        <td align="center">
                          {(() => {
                            count_total += Number(item.total_ot);
                            return item.total_ot;
                          })()}
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

                <tfoot>
                  <tr>
                    <td colSpan={6}></td>
                    <td align="center">{latePegawai}</td>
                    <td align="center"></td>
                    <td align="center">{count_jam}</td>
                    <td align="center">{count_total}</td>
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

      {isCreateOpen && (
        <AbsensiPegawaiCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchDataAbsen(filter.bulan, filter.tahun, filter.pegawai);
          }}
          date={selectedAbsen.date}
          pegawai={{
            id: selectedAbsen.pegawai.id,
            nama: selectedAbsen.pegawai.nama,
          }}
        />
      )}

      {isEditOpen && (
        <AbsensiPegawaiEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchDataAbsen(filter.bulan, filter.tahun, filter.pegawai);
          }}
          date={selectedAbsen.date}
          pegawai={{
            id: selectedAbsen.pegawai.id,
            nama: selectedAbsen.pegawai.nama,
          }}
          absen={{
            absen_id: selectedAbsen.absen?.absen_id,
            absen_masuk: selectedAbsen.absen?.absen_masuk,
            absen_pulang: selectedAbsen.absen?.absen_pulang,
          }}
        />
      )}
    </>
  );
}
