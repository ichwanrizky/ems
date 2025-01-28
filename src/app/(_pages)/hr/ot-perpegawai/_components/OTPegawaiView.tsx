"use client";

import {
  AccessDepartmentProps,
  AccessProps,
  isLoadingProps,
  OvertimeMonthlyProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import {
  deleteAbsensiPerpegawai,
  getPegawaiAbsen,
} from "../../absensiperpegawai/_libs/action";
import { deleteOvertimePegawai, getOvertimePegawai } from "../_libs/action";
import Select from "react-select";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { DisplayDate, getDayInIndonesian } from "@/libs/DisplayDate";
import Button from "@/components/Button";

type OTPegawaiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function OTPegawaiView(props: OTPegawaiViewProps) {
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

  const [pegawaiData, setPegawaiData] = useState(
    [] as {
      id: number;
      nama: string;
    }[]
  );

  const [otDataa, setOtData] = useState([] as OvertimeMonthlyProps[]);

  useEffect(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      pegawai: "",
    }));
    setOtData([]);
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

  const fetchDataOt = async (
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

      const result = await getOvertimePegawai(data);
      if (result.status) {
        setOtData(result.data);
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

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteOvertimePegawai(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchDataOt(filter.bulan, filter.tahun, filter.pegawai);
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
                setOtData([]);
                if (e) {
                  setFilter({ ...filter, pegawai: e.value });
                  fetchDataOt(filter.bulan, filter.tahun, e.value);
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
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th>NAMA</th>
                    <th style={{ width: "15%" }}>TANGGAL</th>
                    <th style={{ width: "15%" }}>HARI</th>
                    <th style={{ width: "10%" }}>OT</th>
                    <th style={{ width: "10%" }}>OT TOTAL</th>
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
                  ) : otDataa.length > 0 ? (
                    otDataa.map((item, index) => (
                      <tr key={index}>
                        <td align="center">
                          <Button
                            type="actionTable2"
                            indexData={index}
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
                        <td align="center">{index + 1}</td>
                        <td>{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="center">
                          {new Date(item.tanggal)
                            .toLocaleString("id-ID", DisplayDate)
                            .replaceAll(".", ":")}
                        </td>
                        <td
                          align="center"
                          style={{
                            color: item.is_holiday ? "red" : "",
                          }}
                        >
                          {getDayInIndonesian(item.tanggal)}
                        </td>
                        <td align="center">
                          {(() => {
                            count_jam += Number(item.jam);
                            return item.jam ? `${item.jam} jam` : "";
                          })()}
                        </td>
                        <td align="center">
                          {(() => {
                            count_total += Number(item.total);
                            return item.total;
                          })()}
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

                <tfoot>
                  <tr>
                    <td colSpan={5}></td>
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
    </>
  );
}
