import { redirect } from "next/navigation";
import React from "react";
import AccessEditView from "../_components/AccessEditView";
import { CreateAccessProps, getAccessByRoles } from "../_libs/action";

const getAccess = async (role_id: number) => {
  try {
    const result = await getAccessByRoles(role_id);
    if (!result.status) return null;
    return result.data as CreateAccessProps;
  } catch (error) {
    return null;
  }
};

export default async function AccessEditPage({
  searchParams,
}: {
  searchParams: {
    role_id?: string;
  };
}) {
  const role_id = (await searchParams).role_id;
  if (!role_id) redirect("/config/access");

  const accessData = await getAccess(Number(role_id));
  if (!accessData) redirect("/config/access");

  return (
    <div className="main-content" style={{ height: "90vh", overflowY: "auto" }}>
      <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
        <div className="breadcrumb-title pe-3">Access</div>
        <div className="ps-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 p-0">
              <li className="breadcrumb-item active" aria-current="page">
                Edit
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <AccessEditView role_id={Number(role_id)} accessData={accessData} />
    </div>
  );
}
