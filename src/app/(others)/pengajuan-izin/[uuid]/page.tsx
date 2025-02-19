import React from "react";
import PengajuanIzinView from "./_components/PengajuanIzinView";

export default async function PengajuanIzin({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const uuid = (await params).uuid;

  return <PengajuanIzinView uuid={uuid} />;
}
