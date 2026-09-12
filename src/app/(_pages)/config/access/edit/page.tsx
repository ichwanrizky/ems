import { redirect } from "next/navigation";
import React from "react";
import { CreateAccessProps, getAccessByRoles } from "../_libs/action";
import AccessEdit from "../_components/AccessEdit";

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
  searchParams: Promise<{
    role_id: string;
  }>;
}) {
  const role_id = (await searchParams).role_id;
  if (!role_id) redirect("/config/access");

  const accessData = await getAccess(Number(role_id));
  if (!accessData) redirect("/config/access");

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Access</a>
            </li>
            <li className="breadcrumb-item">Edit</li>
          </ol>
        </div>

      <AccessEdit role_id={Number(role_id)} accessData={accessData} />
    </>
  );
}
