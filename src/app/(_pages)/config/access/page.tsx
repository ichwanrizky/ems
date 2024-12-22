import React from "react";
import AccessView from "./_components/AccessView";

export default function AccessPage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Access</div>
      </div>
      <AccessView />
    </div>
  );
}
