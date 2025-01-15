import React from "react";
import { getDepartment } from "../department/_libs/action";
import TanggalMerahView from "./_components/TanggalMerahView";

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

export default async function TanggalMerahPage() {
  const departmentData = await getDataDepartment();

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Tanggal Merah</div>
      </div>

      <TanggalMerahView departmentData={departmentData} />
    </div>
  );
}
