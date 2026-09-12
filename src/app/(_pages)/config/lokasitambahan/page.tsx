import { authOptions } from "@/libs/AuthOptions";
import { SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import LokasiTambahanView from "./_components/LokasiTambahanView";

export default async function LokasiTambahanPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  const defaultDeptId = session.user.access_department?.[0]?.department.id ?? 0;

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Lokasi Tambahan</a>
            </li>
          </ol>
        </div>

      {session.user.role_id === 1 ? (
        <LokasiTambahanView
          accessDepartment={session.user.access_department || []}
          defaultDepartmentId={defaultDeptId}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
