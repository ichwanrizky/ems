import React from "react";
import SlipGajiView from "./_components/SlipGajiView";

export default function SlipGaji({ params }: { params: { uuid: string } }) {
  return <SlipGajiView uuid={params.uuid} />;
}
