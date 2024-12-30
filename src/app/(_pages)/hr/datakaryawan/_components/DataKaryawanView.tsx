"use client";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import {
  AccessDepartmentProps,
  AccessProps,
  AccessSubDepartmentProps,
  isLoadingProps,
  PegawaiProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import { deleteDataKaryawan, getPegawai } from "../_libs/action";
import { useRouter } from "next/navigation";

type DataKaryawanViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessSubDepartment: AccessSubDepartmentProps;
  accessMenu: AccessProps;
};

export default function DataKaryawanView(props: DataKaryawanViewProps) {
  const { accessDepartment, accessSubDepartment, accessMenu } = props;

  const { push } = useRouter();

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

  const [pegawaiData, setPegawaiData] = useState([] as PegawaiProps[]);

  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    [] as AccessSubDepartmentProps
  );
  const [filter, setFilter] = useState({
    department: "",
    sub_department: "",
    active: true,
  });

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
    fetchData(debouncedSearchTerm, filter);
  }, [debouncedSearchTerm, filter]);

  const fetchData = async (
    search = "",
    filter = {
      department: "",
      sub_department: "",
      active: true,
    }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getPegawai(search, filter);
      if (result.status) {
        setPegawaiData(result.data as PegawaiProps[]);
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
        const result = await deleteDataKaryawan(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData();
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
              className="form-select me-2"
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
              <option value="">-- DEPT --</option>
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>

            <select
              className="form-select me-2"
              onChange={(e) =>
                setFilter({ ...filter, sub_department: e.target.value })
              }
            >
              <option value="">-- SUB DEPT --</option>
              {selectedSubDepartment?.map((item, index: number) => (
                <option value={item.sub_department.id} key={index}>
                  {item.sub_department.nama_sub_department}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              onChange={(e) =>
                setFilter({
                  ...filter,
                  active: e.target.value === "1" ? true : false,
                })
              }
            >
              <option value="1">ACTIVE</option>
              <option value="0">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button
                type="createTable"
                onClick={() => push("/hr/datakaryawan/create")}
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
                    <th style={{ width: "1%" }}>NO</th>
                    <th>ID</th>
                    <th>NAMA</th>
                    <th>DEPT.</th>
                    <th>SUB DEPT.</th>
                    <th>POSISI</th>
                    <th>ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={8} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : pegawaiData.length > 0 ? (
                    pegawaiData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">
                          <Button
                            type="actionTable"
                            indexData={index}
                            isLoading={isLoadingAction[item.id]}
                            onEdit={() => {
                              if (accessMenu.update) {
                                push(
                                  `/hr/datakaryawan/edit?karyawan_id=${item.id}`
                                );
                              } else {
                                setAlertPage({
                                  status: true,
                                  color: "danger",
                                  message: "You don't have access to edit",
                                  subMessage: "",
                                });
                              }
                            }}
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
                        <td align="center">{item.panji_id}</td>
                        <td>{item.nama}</td>
                        <td align="center">
                          {item.department.nama_department}
                        </td>
                        <td align="center">
                          {item.sub_department?.nama_sub_department}
                        </td>
                        <td align="center">{item.position}</td>
                        <td align="center">
                          {item.is_active ? "ACTIVE" : "INACTIVE"}
                        </td>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
