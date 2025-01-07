"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  AccessDepartmentProps,
  AccessProps,
  isLoadingProps,
  PegawaiShiftProps,
  ShiftMasterProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import { getShiftMaster } from "../../shift-master/_libs/action";
import { DisplayHour } from "@/libs/DisplayDate";
import { getPegawaiShift, SavePegawaiShift } from "../_libs/action";

type ShiftActiveViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function ShiftActiveView(props: ShiftActiveViewProps) {
  const { accessDepartment, accessMenu } = props;
  const [loadingPage, setLoadingPage] = useState(true);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id?.toString() || "",
  });

  const [shiftMasterData, setShiftMasterData] = useState(
    [] as ShiftMasterProps[]
  );
  const [pegawaiShiftData, setPegawaiShiftData] = useState(
    [] as PegawaiShiftProps[]
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
    fetchData(filter.department);
  }, [filter]);

  const fetchData = async (department = "") => {
    setLoadingPage(true);
    try {
      const result = await getShiftMaster("", department);
      const result2 = await getPegawaiShift(department);
      if (result.status && result2.status) {
        setShiftMasterData(result.data as ShiftMasterProps[]);
        setPegawaiShiftData(result2.data as PegawaiShiftProps[]);
      } else {
        setAlertPage({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: !result.status ? result.message : result2.message,
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

  const toggleShiftActive = (pegawaiId: number, shiftId: number) => {
    setPegawaiShiftData(
      pegawaiShiftData.map((item: PegawaiShiftProps) =>
        item.id === pegawaiId ? { ...item, shift_id: shiftId } : item
      )
    );
  };

  const toogleSelectAll = (shiftId: number) => {
    setPegawaiShiftData(
      pegawaiShiftData.map((item: PegawaiShiftProps) => ({
        ...item,
        shift_id: shiftId,
      }))
    );
  };

  const handleSubmit = async () => {
    if (confirm("Save this data?")) {
      setLoadingPage(true);
      try {
        const result = await SavePegawaiShift(pegawaiShiftData);
        if (result.status) {
          setAlertPage({
            status: true,
            color: result.status ? "success" : "danger",
            message: result.status ? "Success" : "Failed",
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
    }

    return;
  };

  return (
    <>
      <div className="row g-3">
        <div className="col-auto"></div>
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select"
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
            >
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto"></div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button type="saveTable" onClick={() => handleSubmit()} />
            )}
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
                    <th>NAMA KARYAWAN</th>
                    {shiftMasterData.map((item, index) => (
                      <th
                        key={index}
                        style={{
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          width: "15%",
                        }}
                      >
                        {new Date(item.jam_masuk)
                          .toLocaleString("id-ID", DisplayHour)
                          .replaceAll(".", ":")}
                        {" - "}
                        {new Date(item.jam_pulang)
                          .toLocaleString("id-ID", DisplayHour)
                          .replaceAll(".", ":")}{" "}
                        <br />
                        <a href="#!" onClick={() => toogleSelectAll(item.id)}>
                          CHECK ALL
                        </a>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={2 + shiftMasterData.length} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : pegawaiShiftData.length > 0 ? (
                    pegawaiShiftData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td>{item.nama}</td>
                        {shiftMasterData?.map((item2, index: number) => (
                          <td align="center" key={index}>
                            <input
                              type="radio"
                              name={item.id.toString()}
                              onChange={() =>
                                toggleShiftActive(item.id, item2.id)
                              }
                              checked={
                                item.shift_id === item2.id ? true : false
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2 + shiftMasterData.length} align="center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
