import { authOptions } from "@/libs/AuthOptions";
import { SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import LokasiTambahanView from "./_components/LokasiTambahanView";

export default async function LokasiTambahanPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  const defaultDeptId = session.user.access_department?.[0]?.department.id ?? 0;

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Lokasi Tambahan</div>
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
    </div>
  );
}
