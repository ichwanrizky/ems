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
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Data Karyawan</a>
            </li>
            <li className="breadcrumb-item">Create</li>
          </ol>
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
    </>
  );
}
