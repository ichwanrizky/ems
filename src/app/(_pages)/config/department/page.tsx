import React from "react";
import DepartmentView from "./_components/DepartmentView";

export default function DepartmentPage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Department</div>
      </div>

      <DepartmentView />
    </div>
  );
}
