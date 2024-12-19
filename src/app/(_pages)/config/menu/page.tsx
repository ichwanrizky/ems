import React from "react";
import MenuView from "./_components/MenuView";

export default function MenuPage() {
  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Menu</div>
      </div>

      <MenuView />
    </div>
  );
}
