"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getRoles } from "../../roles/_libs/action";
import { DepartmentProps, RolesProps, SubDepartmentProps } from "@/types";
import { getDepartment } from "../../department/_libs/action";
import { getSubDepartmentMultipleDepartment } from "../../sub_department/_libs/action";
import { getMenuAccess, MenuAccessProps } from "../_libs/action";
import { table } from "console";

export default function AccessCreateView() {
  const [rolesData, setRolesData] = useState([] as RolesProps[]);
  const [departmentData, setDepartmentData] = useState([] as DepartmentProps[]);
  const [subDepartmentData, setSubDepartmentData] = useState(
    [] as SubDepartmentProps[]
  );
  const [menuAccessData, setMenuAccessData] = useState([] as MenuAccessProps[]);
  console.log("🚀 ~ AccessCreateView ~ menuAccessData:", menuAccessData);

  const [formData, setFormData] = useState({
    role_id: null as number | null,
    department_id: [] as { value: number; label: string }[],
    sub_department_id: [] as { value: number; label: string }[],
  });

  useEffect(() => {
    handleGetRoles();
    handleGetDepartment();
    handleGetMenuAccess();
  }, []);

  const handleGetRoles = async () => {
    try {
      const result = await getRoles();
      if (result.status) setRolesData(result.data as RolesProps[]);
    } catch (error) {}
  };

  const handleGetDepartment = async () => {
    try {
      const result = await getDepartment();
      if (result.status) setDepartmentData(result.data as DepartmentProps[]);
    } catch (error) {}
  };

  const handleGetSubDepartment = async (
    department_id: { value: number; label: string }[]
  ) => {
    try {
      const result = await getSubDepartmentMultipleDepartment(department_id);
      if (result.status)
        setSubDepartmentData(result.data as SubDepartmentProps[]);
    } catch (error) {}
  };

  const handleGetMenuAccess = async () => {
    try {
      const result = await getMenuAccess();
      if (result.status) setMenuAccessData(result.data as MenuAccessProps[]);
    } catch (error) {}
  };

  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-12">
          <div className="card">
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
                          ?.map((e) => ({ value: e.id, label: e.role_name }))
                          .find((option) => option.value === formData.role_id)
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
                    <h6 className="text-primary fw-bold ">{item.menu_group}</h6>
                    <table className="table table-bordered mb-4">
                      <thead>
                        <tr>
                          <th>MENU</th>
                          <th style={{ width: "100px", textAlign: "center" }}>
                            VIEW
                          </th>
                          <th style={{ width: "100px", textAlign: "center" }}>
                            INSERT
                          </th>
                          <th style={{ width: "100px", textAlign: "center" }}>
                            UPDATE
                          </th>
                          <th style={{ width: "100px", textAlign: "center" }}>
                            DELETE
                          </th>
                          <td
                            style={{ width: "50px", textAlign: "center" }}
                          ></td>
                        </tr>
                      </thead>
                      <tbody>
                        {item.menu?.map((menu) => (
                          <tr key={menu.id}>
                            <td>{menu.menu}</td>
                            <td align="center">
                              <input type="checkbox" />
                            </td>
                            <td align="center">
                              <input type="checkbox" />
                            </td>
                            <td align="center">
                              <input type="checkbox" />
                            </td>
                            <td align="center">
                              <input type="checkbox" />
                            </td>
                            <td align="center">
                              <input type="checkbox" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
