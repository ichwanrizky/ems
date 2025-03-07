"use client";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { AccessDepartmentProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import { deleteUser, getUser, getUserId, resetPassword } from "../_libs/action";
import Button from "@/components/Button";
import UserEdit from "./UserEdit";

type UserViewProps = {
  accessDepartment: AccessDepartmentProps;
};

export default function UserView(props: UserViewProps) {
  const { accessDepartment } = props;

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

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [userData, setUserData] = useState(
    [] as {
      number: number;
      id: number;
      username: string;
      pegawai: {
        id: number;
        nama: string;
        telp: string;
      };
    }[]
  );
  const [userEdit, setUserEdit] = useState<{
    id: number;
    username: string;
    pegawai: {
      id: number;
      nama: string;
      telp: string;
    };
  } | null>();

  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id || "",
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
    fetchData(debouncedSearchTerm, filter, currentPage);
  }, [debouncedSearchTerm, filter, currentPage]);

  const fetchData = async (
    search: string,
    filter?: {
      department: string | number;
    },
    currentPage?: number
  ) => {
    setLoadingPage(true);
    try {
      const result = await getUser(search, filter, currentPage);
      if (result.status) {
        setUserData(result.data as []);
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

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getUserId(id);
      if (result.status) {
        setUserEdit(result.data);
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
        const result = await deleteUser(id);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData("", filter, currentPage);
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

  const handleResetPassword = async (id: number) => {
    if (confirm("Reset password this data?")) {
      setIsLoadingAction({ ...isLoadingAction, [id]: true });
      try {
        const result = await resetPassword(id);
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
            <select
              className="form-select me-2 ms-2"
              onChange={(e) => {
                setFilter({ ...filter, department: e.target.value });
              }}
            >
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
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
                    <th style={{ width: "1%" }}></th>
                    <th style={{ width: "1%" }}>NO</th>
                    <th>NAMA</th>
                    <th style={{ width: "20%" }}>USERNAME</th>
                    <th style={{ width: "20%" }}>TELP</th>
                    <th style={{ width: "10%" }}></th>
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
                  ) : userData.length > 0 ? (
                    userData.map((item, index) => (
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
                        <td align="center">{item.number}</td>
                        <td align="left">{item.pegawai.nama?.toUpperCase()}</td>
                        <td align="left">{item.username}</td>
                        <td align="left">{item.pegawai.telp}</td>
                        <td align="center">
                          {isLoadingAction[item.id] ? (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled
                            >
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              LOADING ...
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleResetPassword(item.id)}
                            >
                              RESET PASS
                            </button>
                          )}
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
                currentPage={currentPage}
                totalPage={totalPage}
                maxPagination={maxPagination}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <UserEdit
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            fetchData("", filter, currentPage);
          }}
          userEdit={userEdit}
        />
      )}
    </>
  );
}
