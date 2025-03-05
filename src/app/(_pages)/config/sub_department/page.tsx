import React from "react";
import SubDepartmentView from "./_components/SubDepartmentView";
import { getDepartment } from "../department/_libs/action";
import { SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/AuthOptions";

export default async function SubDepartmentPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Sub Department</div>
      </div>

      {session.user.role_id === 1 ? (
        <SubDepartmentView
          accessDepartment={session.user.access_department || []}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </div>
  );
}
