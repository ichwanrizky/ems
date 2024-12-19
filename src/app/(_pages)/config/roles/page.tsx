import React from "react";
import RolesView from "./_components/RolesView";

export default function RolesPage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Roles</div>
      </div>

      <RolesView />
    </div>
  );
}
