"use client";
import Button from "@/components/Button";
import { DepartmentProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import {
  deleteTanggalMerah,
  getTanggalMerah,
  getTanggalMerahId,
} from "../_libs/action";
import TanggalMerahCreate from "./TanggalMerahCreate";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { DisplayMonthName } from "@/libs/DisplayDate";
import TanggalMerahEdit from "./TanggalMerahEdit";

type Props = {
  departmentData: DepartmentProps[];
};

export default function TanggalMerahView(props: Props) {
  const { departmentData } = props;

  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [filter, setFilter] = useState({
    department: departmentData[0].id as string | number,
    tahun: new Date().getFullYear() as string | number,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [tanggalMerahData, setTanggalMerahData] = useState(
    [] as {
      id: number;
      bulan: number;
      tahun: number;
      tanggal_merah_list: {
        tanggal_nomor: string;
      }[];
      department: {
        id: number;
        nama_department: string;
      };
    }[]
  );

  const [tanggalMerahEdit, setTanggalMerahEdit] = useState(
    {} as {
      id: number;
      bulan: number;
      tahun: number;
      tanggal_merah_list: {
        tanggal_nomor: string;
      }[];
      department: {
        id: number;
        nama_department: string;
      };
    }
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
    fetchData(filter);
  }, [filter]);

  const fetchData = async (filter: {
    department: string | number;
    tahun: string | number;
  }) => {
    setLoadingPage(true);
    try {
      const result = await getTanggalMerah(filter);
      if (result.status) {
        setTanggalMerahData(result.data);
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

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getTanggalMerahId(id);
      if (result.status) {
        setTanggalMerahEdit(
          result.data as {
            id: number;
            bulan: number;
            tahun: number;
            tanggal_merah_list: {
              tanggal_nomor: string;
            }[];
            department: {
              id: number;
              nama_department: string;
            };
          }
        );
        setIsEditOpen(true);
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
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await deleteTanggalMerah(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
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

  return (
    <>
      <div className="row g-3">
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select me-2"
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
              value={filter.department}
            >
              <option value="">--DEPT--</option>
              {departmentData?.map((item, index: number) => (
                <option value={item.id} key={index}>
                  {item.nama_department?.toUpperCase()}
                </option>
              ))}
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
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            <Button type="createTable" onClick={() => setIsCreateOpen(true)} />
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
                    <th>DEPT.</th>
                    <th style={{ width: "10%" }}>TAHUN</th>
                    <th style={{ width: "10%" }}>BULAN</th>
                    <th style={{ width: "30%" }}>TANGGAL</th>
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
                  ) : tanggalMerahData.length > 0 ? (
                    tanggalMerahData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">
                          <Button
                            type="actionTable"
                            indexData={index}
                            isLoading={isLoadingAction[item.id]}
                            onEdit={() => handleGetEdit(item.id)}
                            onDelete={() => handleDelete(item.id)}
                          >
                            <i className="bi bi-three-dots" />
                          </Button>
                        </td>
                        <td align="center">{index + 1}</td>
                        <td>
                          {item.department.nama_department?.toUpperCase()}
                        </td>
                        <td align="center">{item.tahun}</td>
                        <td align="center">
                          {DisplayMonthName(item.bulan)?.toUpperCase()}
                        </td>
                        <td align="left" className="text-nowrap">
                          {item.tanggal_merah_list
                            .map((item) => item.tanggal_nomor)
                            .join(", ")}
                        </td>
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

              <Pagination
                currentPage={1}
                maxPagination={1}
                totalPage={1}
                setCurrentPage={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <TanggalMerahCreate
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            fetchData(filter);
          }}
          departmentData={departmentData}
        />
      )}

      {isEditOpen && (
        <TanggalMerahEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchData(filter);
          }}
          departmentData={departmentData}
          tanggalMerahEdit={tanggalMerahEdit}
        />
      )}
    </>
  );
}
