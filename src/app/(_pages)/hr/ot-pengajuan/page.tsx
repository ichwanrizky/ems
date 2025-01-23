import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";
import OTPengajuanView from "./_components/OTPengajuanView";

export default async function IzinRiwayatPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "hr/ot-pengajuan";

  const allMenus =
    session.user.menu?.map((group) => group.menu || []).flat() || [];

  const foundMenu = allMenus.find(
    (menuItem) => menuItem.path === targetPath
  ) as {
    id: number;
    menu: string;
    path: string;
    access: AccessProps[];
  };

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Data Pengajuan OT</div>
      </div>

      {foundMenu ? (
        <OTPengajuanView
          accessDepartment={session.user.access_department || []}
          accessMenu={foundMenu.access[0] || {}}
          accessSubDepartment={session.user.access_sub_department || []}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </div>
  );
}
