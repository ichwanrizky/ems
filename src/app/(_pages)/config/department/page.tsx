import React from "react";
import DepartmentView from "./_components/DepartmentView";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/AuthOptions";

export default async function DepartmentPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Section</a>
            </li>
          </ol>
        </div>

      {session.user.role_id === 1 ? (
        <DepartmentView />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
