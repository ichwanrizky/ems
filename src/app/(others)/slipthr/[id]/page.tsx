import React from "react";
import SlipThrView from "./_components/SlipThrView";

export default async function SlipThrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uuid = (await params).id;

  return <SlipThrView uuid={uuid} />;
}
