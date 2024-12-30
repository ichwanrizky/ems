"use client";

import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  AccessDepartmentProps,
  AccessProps,
  isLoadingProps,
  ShiftMasterProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import { getShiftMaster } from "../../shift-master/_libs/action";
import { DisplayHour } from "@/libs/DisplayDate";

type ShiftActiveViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function ShiftActiveView(props: ShiftActiveViewProps) {
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id?.toString() || "",
  });

  const [shiftMasterData, setShiftMasterData] = useState(
    [] as ShiftMasterProps[]
  );
  console.log(shiftMasterData);

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
    fetchData(debouncedSearchTerm, filter.department);
  }, [debouncedSearchTerm, filter]);

  const fetchData = async (search = "", department = "") => {
    setLoadingPage(true);
    try {
      const result = await getShiftMaster(search, department);
      if (result.status) {
        setShiftMasterData(result.data as ShiftMasterProps[]);
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
            <select
              className="form-select"
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
            >
              <option value="">-- DEPT --</option>
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
              <Button
                type="createTable"
                onClick={() => setIsCreateOpen(true)}
              />
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
                          .replaceAll(".", ":")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={6} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : shiftMasterData.length > 0 ? (
                    shiftMasterData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} align="center">
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
