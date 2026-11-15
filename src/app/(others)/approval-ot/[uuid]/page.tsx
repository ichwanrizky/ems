import React from "react";
import ApprovalOtView from "./_components/ApprovalOtView";

export default async function ApprovalOt({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const uuid = (await params).uuid;

  return <ApprovalOtView uuid={uuid} />;
}
