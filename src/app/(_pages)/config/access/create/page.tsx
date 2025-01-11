import React from "react";
import AccessCreate from "../_components/AccessCreate";

export default function AccessCreatePage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Access</div>
        <div className="ps-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 p-0">
              <li className="breadcrumb-item active" aria-current="page">
                Create
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <AccessCreate />
    </div>
  );
}
