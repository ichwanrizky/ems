import { authOptions } from "@/libs/AuthOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getDepartmentId } from "../_libs/action";
import DepartmentLokasiView from "./_components/DepartmentLokasiView";

export default async function DepartmentLokasiPage({
  searchParams,
}: {
  searchParams: Promise<{ department_id: string }>;
}) {
  const session: any = await getServerSession(authOptions);
  if (!session) return null;

  const { department_id } = await searchParams;
  if (!department_id) redirect("/config/department");

  const dept = await getDepartmentId(Number(department_id));
  if (!dept.status || !dept.data) redirect("/config/department");

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Section</a>
            </li>
            <li className="breadcrumb-item"><a href="/config/department">List</a></li>
            <li className="breadcrumb-item">Lokasi</li>
          </ol>
        </div>

      {session.user.role_id === 1 ? (
        <DepartmentLokasiView
          departmentId={Number(department_id)}
          departmentName={dept.data.nama_department}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
