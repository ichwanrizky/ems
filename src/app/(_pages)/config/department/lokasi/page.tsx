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
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Section</div>
        <div className="ps-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 p-0">
              <li className="breadcrumb-item">
                <a href="/config/department">List</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Lokasi
              </li>
            </ol>
          </nav>
        </div>
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
    </div>
  );
}
