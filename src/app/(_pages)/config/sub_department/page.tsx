import React from "react";
import SubDepartmentView from "./_components/SubDepartmentView";
import { getDepartment } from "../department/_libs/action";

const getDataDepartment = async () => {
  try {
    const result = await getDepartment("");
    if (result.status) {
      return result.data;
    }

    return [];
  } catch (error) {
    return [];
  }
};

export default async function SubDepartmentPage() {
  const departmentData = await getDataDepartment();

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Sub Department</div>
      </div>

      <SubDepartmentView departmentData={departmentData} />
    </div>
  );
}
