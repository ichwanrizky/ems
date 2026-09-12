import React from "react";
import SubDepartmentView from "./_components/SubDepartmentView";
import { DepartmentProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/AuthOptions";
import { getDepartment } from "./_libs/action";

const handleGetDepartment = async () => {
  try {
    const result = await getDepartment();
    return result.data as DepartmentProps[];
  } catch (error) {
    return [];
  }
};

export default async function SubDepartmentPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  const departmentData = await handleGetDepartment();

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Department</a>
            </li>
          </ol>
        </div>

      {session.user.role_id === 1 ? (
        <SubDepartmentView departmentData={departmentData} />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
