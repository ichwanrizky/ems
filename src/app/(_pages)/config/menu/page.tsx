import React from "react";
import MenuView from "./_components/MenuView";
import { SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/AuthOptions";

export default async function MenuPage() {
  const session: SeesionProps | null = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <>
      <div className="row page-titles mx-0">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">
              <a href="javascript:void(0)">Menu</a>
            </li>
          </ol>
        </div>

      {session.user.role_id === 1 ? (
        <MenuView />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
