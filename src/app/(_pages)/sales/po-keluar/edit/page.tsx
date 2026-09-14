import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import PoKeluarForm from "../_components/PoKeluarForm";
import { getPoKeluarId } from "../_libs/action";

export default async function PoKeluarEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const id = (await searchParams).id;
  if (!id) redirect("/sales/po-keluar");

  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "sales/po-keluar";

  const allMenus =
    session.user.menu?.map((group) => group.menu || []).flat() || [];

  const foundMenu = allMenus.find(
    (menuItem) => menuItem.path === targetPath,
  ) as {
    id: number;
    menu: string;
    path: string;
    access: AccessProps[];
  };

  if (!foundMenu || !foundMenu.access[0]?.update) {
    return (
      <div className="d-flex justify-content-center align-items-center text-danger">
        Access Denied
      </div>
    );
  }

  const hasil = await getPoKeluarId(Number(id));
  if (!hasil.status || !hasil.data) redirect("/sales/po-keluar");

  return (
    <>
      <div className="row page-titles mx-0">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="javascript:void(0)">Sales</a>
          </li>
          <li className="breadcrumb-item active">
            <a href="/sales/po-keluar">PO Keluar</a>
          </li>
          <li className="breadcrumb-item">Edit</li>
        </ol>
      </div>

      <PoKeluarForm poEdit={hasil.data} />
    </>
  );
}
