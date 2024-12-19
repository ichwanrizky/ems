import React from "react";
import MenuGroupView from "./_components/MenuGroupView";

export default function MenuGroupPage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Menu Group</div>
      </div>

      <MenuGroupView />
    </div>
  );
}
