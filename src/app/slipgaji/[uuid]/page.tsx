import React from "react";
import SlipGajiView from "./_components/SlipGajiView";

export default async function SlipGaji({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const uuid = (await params).uuid;

  return <SlipGajiView uuid={uuid} />;
}
