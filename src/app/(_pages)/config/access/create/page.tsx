import React from "react";
import AccessCreate from "../_components/AccessCreate";

export default function AccessCreatePage() {
  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Access</a>
            </li>
            <li className="breadcrumb-item">Create</li>
          </ol>
        </div>

      <AccessCreate />
    </>
  );
}
