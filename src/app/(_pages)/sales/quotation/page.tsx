import { authOptions } from "@/libs/AuthOptions";
import { AccessProps, SeesionProps } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";
import QuotationView from "./_components/QuotationView";

export default async function QuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Halaman daftar dibaca dari URL, bukan cuma state komponen.
  //
  // Tanpa ini, kembali dari form edit selalu mendarat di halaman 1 — dan
  // dengan 5.000-an penawaran, itu berarti menyusuri ulang daftarnya sampai
  // baris yang barusan disunting. Ia juga membuat halamannya bisa disegarkan
  // dan ditautkan tanpa kehilangan posisi.
  const halamanAwal = Number((await searchParams).page);

  const session: SeesionProps | null = await getServerSession(authOptions);

  if (!session) return null;

  const targetPath = "sales/quotation";

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

  return (
    <>
      <div className="row page-titles mx-0">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="javascript:void(0)">Sales</a>
          </li>
          <li className="breadcrumb-item active">
            <a href="javascript:void(0)">Quotation</a>
          </li>
        </ol>
      </div>

      {foundMenu ? (
        <QuotationView
          accessMenu={foundMenu.access[0] || {}}
          halamanAwal={
            Number.isInteger(halamanAwal) && halamanAwal > 0 ? halamanAwal : 1
          }
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center text-danger">
          Access Denied
        </div>
      )}
    </>
  );
}
