"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { DepartmentProps, RolesProps, SubDepartmentProps } from "@/types";
import { getDepartment } from "../../department/_libs/action";
import { getSubDepartmentMultipleDepartment } from "../../sub_department/_libs/action";
import {
  CreateAccessProps,
  editAccess,
  getMenuAccess,
  getRolesAccess,
  MenuAccessProps,
} from "../_libs/action";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";

export default function AccessEditView({
  role_id,
  accessData,
}: {
  role_id: number;
  accessData: CreateAccessProps;
}) {
  const [alert, setAlert] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const { push } = useRouter();

  const [rolesData, setRolesData] = useState([] as RolesProps[]);
  const [departmentData, setDepartmentData] = useState([] as DepartmentProps[]);
  const [subDepartmentData, setSubDepartmentData] = useState(
    [] as SubDepartmentProps[]
  );
  const [menuAccessData, setMenuAccessData] = useState([] as MenuAccessProps[]);

  const [formData, setFormData] = useState({
    role_id: accessData.role_id || (null as number | null),
    department_id:
      accessData.department_id || ([] as { value: number; label: string }[]),
    sub_department_id:
      accessData.sub_department_id ||
      ([] as { value: number; label: string }[]),
    access: (accessData.access as any[]) || ([] as any[]),
  });

  useEffect(() => {
    if (alert.status) {
      const timer = setTimeout(() => {
        setAlert({
          status: false,
          color: "",
          message: "",
          subMessage: "",
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    handleGetRoles();
    handleGetDepartment();
    handleGetMenuAccess();
    handleGetSubDepartment(formData.department_id);
  }, []);

  const handleGetRoles = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getRolesAccess(role_id);
      if (result.status) setRolesData(result.data as RolesProps[]);
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Something went wrong",
        subMessage: "Please refresh and try again",
      });
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleGetDepartment = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getDepartment();
      if (result.status) setDepartmentData(result.data as DepartmentProps[]);
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Something went wrong",
        subMessage: "Please refresh and try again",
      });
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleGetSubDepartment = async (
    department_id: { value: number; label: string }[]
  ) => {
    try {
      const result = await getSubDepartmentMultipleDepartment(department_id);
      if (result.status)
        setSubDepartmentData(result.data as SubDepartmentProps[]);
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Something went wrong",
        subMessage: "Please refresh and try again",
      });
    }
  };

  const handleGetMenuAccess = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getMenuAccess();
      if (result.status) setMenuAccessData(result.data as MenuAccessProps[]);
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Something went wrong",
        subMessage: "Please refresh and try again",
      });
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleCheckedAccess = (
    menuId: number,
    action: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      // Clone the current access array
      const newAccess = [...prev.access];

      // Find the index of the entry for the given menuId
      const existingAccessIndex = newAccess.findIndex(
        (access) => access.menu_id === menuId
      );

      if (checked) {
        if (existingAccessIndex !== -1) {
          // Update the specific action in the existing entry
          newAccess[existingAccessIndex] = {
            ...newAccess[existingAccessIndex],
            [action]: true,
          };
        } else {
          // Add a new entry for the menuId
          newAccess.push({
            menu_id: menuId,
            [action]: true,
          });
        }
      } else {
        if (existingAccessIndex !== -1) {
          const updatedEntry = { ...newAccess[existingAccessIndex] };
          delete updatedEntry[action];

          // If no actions remain, remove the entry entirely
          if (
            Object.keys(updatedEntry).length === 1 &&
            updatedEntry.menu_id !== undefined
          ) {
            newAccess.splice(existingAccessIndex, 1);
          } else {
            // Otherwise, update the entry with remaining actions
            newAccess[existingAccessIndex] = updatedEntry;
          }
        }
      }

      return { ...prev, access: newAccess };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editAccess(formData as any);
        if (result.status) {
          setAlert({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          setTimeout(() => {
            push("/config/access");
          }, 1000);
        } else {
          setAlert({
            status: true,
            color: "danger",
            message: "Failed",
            subMessage: result.message,
          });

          setIsLoadingSubmit(false);
        }
      } catch (error) {
        setAlert({
          status: true,
          color: "danger",
          message: "Error",
          subMessage: "Something went wrong, please refresh and try again",
        });
        setIsLoadingSubmit(false);
      }
    }

    return;
  };
  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-12">
          <form onSubmit={handleSubmit}>
            <div className="card">
              {alert.status && (
                <div className="px-3 mt-3">
                  <Alert
                    color={alert.color}
                    message={alert.message}
                    subMessage={alert.subMessage}
                  />
                </div>
              )}

              {isLoadingPage ? (
                <div className="d-flex justify-content-center p-3">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  LOADING ...
                </div>
              ) : (
                <>
                  <div className="card-body">
                    <div className="form-group mb-3">
                      <label htmlFor="urut" className="form-label">
                        ROLES
                      </label>
                      <Select
                        instanceId={"roles"}
                        placeholder="Select Roles"
                        styles={{
                          option: (styles) => ({ ...styles, color: "black" }),
                        }}
                        options={rolesData?.map((e) => ({
                          value: e.id,
                          label: e.role_name,
                        }))}
                        onChange={(e: any) => {
                          setFormData({
                            ...formData,
                            role_id: e ? e.value : null,
                          });
                        }}
                        value={
                          formData.role_id
                            ? rolesData
                                ?.map((e) => ({
                                  value: e.id,
                                  label: e.role_name,
                                }))
                                .find(
                                  (option) => option.value === formData.role_id
                                )
                            : null
                        }
                        isClearable
                        required
                      />
                    </div>
                    <hr />
                    <div className="form-group mb-4">
                      <label htmlFor="urut" className="form-label">
                        ACCESS DEPARTMENT
                      </label>
                      <Select
                        instanceId={"access-department"}
                        placeholder="Select Department"
                        styles={{
                          option: (styles) => ({ ...styles, color: "black" }),
                          multiValueRemove: (styles) => ({
                            ...styles,
                            color: "black",
                          }),
                        }}
                        options={departmentData?.map((e) => ({
                          value: e.id,
                          label: e.nama_department,
                        }))}
                        onChange={(e: any) => {
                          setFormData({
                            ...formData,
                            department_id: e,
                            sub_department_id: [],
                          });
                          setSubDepartmentData([]);
                          if (e) {
                            handleGetSubDepartment(e);
                          }
                        }}
                        value={formData.department_id}
                        isMulti
                        isClearable
                        required
                      />
                    </div>
                    <hr />
                    <div className="form-group mb-4">
                      <label htmlFor="urut" className="form-label">
                        ACCESS SUB DEPARTMENT
                      </label>
                      <Select
                        instanceId={"access-sub-department"}
                        placeholder="Select Sub Department"
                        styles={{
                          option: (styles) => ({ ...styles, color: "black" }),
                          multiValueRemove: (styles) => ({
                            ...styles,
                            color: "black",
                          }),
                        }}
                        options={subDepartmentData?.map((e) => ({
                          value: e.id,
                          label: e.nama_sub_department,
                        }))}
                        onChange={(e: any) => {
                          setFormData({
                            ...formData,
                            sub_department_id: e,
                          });
                        }}
                        value={formData.sub_department_id}
                        isMulti
                        isClearable
                        required
                      />
                    </div>

                    <hr />
                    <div className="form-group mb-4">
                      <label htmlFor="urut" className="form-label">
                        ACCESS MENU
                      </label>

                      {menuAccessData?.map((item, index: number) => (
                        <React.Fragment key={index}>
                          <h6 className="text-primary fw-bold ">
                            {item.menu_group}
                          </h6>
                          <table className="table table-bordered mb-4">
                            <thead>
                              <tr>
                                <th>MENU</th>
                                <th
                                  style={{
                                    width: "100px",
                                    textAlign: "center",
                                  }}
                                >
                                  VIEW
                                </th>
                                <th
                                  style={{
                                    width: "100px",
                                    textAlign: "center",
                                  }}
                                >
                                  INSERT
                                </th>
                                <th
                                  style={{
                                    width: "100px",
                                    textAlign: "center",
                                  }}
                                >
                                  UPDATE
                                </th>
                                <th
                                  style={{
                                    width: "100px",
                                    textAlign: "center",
                                  }}
                                >
                                  DELETE
                                </th>
                                <td
                                  style={{ width: "50px", textAlign: "center" }}
                                ></td>
                              </tr>
                            </thead>
                            <tbody>
                              {item.menu?.map((menu) => {
                                const isChecked = (
                                  menuId: number,
                                  action: string
                                ) => {
                                  const entry = formData.access.find(
                                    (access) => access.menu_id === menuId
                                  );
                                  return entry ? entry[action] === true : false;
                                };

                                const handleCheckAllAccess = (
                                  menuId: number,
                                  checked: boolean
                                ) => {
                                  // Update all actions for the given menuId based on the master checkbox state
                                  const actions = [
                                    "view",
                                    "insert",
                                    "update",
                                    "delete",
                                  ];
                                  actions.forEach((action) =>
                                    handleCheckedAccess(menuId, action, checked)
                                  );
                                };

                                const isCheckedAll = (menuId: number) => {
                                  // Check if all actions are selected for the row
                                  const actions = [
                                    "view",
                                    "insert",
                                    "update",
                                    "delete",
                                  ];
                                  return actions.every((action) =>
                                    isChecked(menuId, action)
                                  );
                                };

                                return (
                                  <tr key={menu.id}>
                                    <td>{menu.menu}</td>
                                    <td align="center">
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleCheckedAccess(
                                            menu.id,
                                            "view",
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked(menu.id, "view")}
                                      />
                                    </td>
                                    <td align="center">
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleCheckedAccess(
                                            menu.id,
                                            "insert",
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked(menu.id, "insert")}
                                      />
                                    </td>
                                    <td align="center">
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleCheckedAccess(
                                            menu.id,
                                            "update",
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked(menu.id, "update")}
                                      />
                                    </td>
                                    <td align="center">
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleCheckedAccess(
                                            menu.id,
                                            "delete",
                                            e.target.checked
                                          )
                                        }
                                        checked={isChecked(menu.id, "delete")}
                                      />
                                    </td>
                                    <td align="center">
                                      <input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleCheckAllAccess(
                                            menu.id,
                                            e.target.checked
                                          )
                                        }
                                        checked={isCheckedAll(menu.id)}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href="/config/access" className="btn btn-secondary me-2">
                      CLOSE
                    </a>

                    {isLoadingSubmit ? (
                      <button
                        type="button"
                        className="btn btn-success"
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
                      <button type="submit" className="btn btn-success">
                        SAVE DATA
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
