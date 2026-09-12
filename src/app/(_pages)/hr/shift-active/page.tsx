import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";
import ShiftActiveView from "./_components/ShiftActiveView";

export default async function ShiftActivePage() {
  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "hr/shift-active";

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
              <a href="javascript:void(0)">Shift - Active</a>
            </li>
          </ol>
        </div>

      {foundMenu ? (
        <ShiftActiveView
          accessDepartment={session.user.access_department || []}
          accessMenu={foundMenu.access[0] || {}}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
