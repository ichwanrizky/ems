import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, PegawaiProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";
import { redirect } from "next/navigation";
import { getPegawaiId } from "../_libs/action";
import DataKaryawanEdit from "../_components/DataKaryawanEdit";

const getPegawai = async (karyawan_id: number) => {
  try {
    const result = await getPegawaiId(karyawan_id);
    if (!result.status) return null;
    return result.data as PegawaiProps;
  } catch (error) {
    return null;
  }
};

export default async function DataKaryawanEditPage({
  searchParams,
}: {
  searchParams: Promise<{
    karyawan_id: string;
  }>;
}) {
  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "hr/datakaryawan";

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

  const karyawan_id = (await searchParams).karyawan_id;
  if (!karyawan_id) redirect("/hr/datakaryawan");

  const pegawaiData = await getPegawai(Number(karyawan_id));
  if (!pegawaiData) redirect("/hr/datakaryawan");

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Data Karyawan</a>
            </li>
            <li className="breadcrumb-item">Edit</li>
          </ol>
        </div>

      {foundMenu && foundMenu.access[0].update ? (
        <DataKaryawanEdit
          accessDepartment={session.user.access_department || []}
          accessSubDepartment={session.user.access_sub_department || []}
          pegawaiData={pegawaiData}
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
