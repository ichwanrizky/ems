import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";
import DataKaryawanCreate from "../_components/DataKaryawanCreate";

export default async function DataKaryawanCreatePage() {
  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "hr/datakaryawan";

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
        <div className="breadcrumb-title pe-3">Data Karyawan</div>
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

      {foundMenu && foundMenu.access[0].insert ? (
        <DataKaryawanCreate
          accessDepartment={session.user.access_department || []}
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
