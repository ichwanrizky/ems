import React from "react";

export const FilterBulan = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Augustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return (
      <option value={i + 1} key={i}>
        {monthNames[i]?.toUpperCase()}
      </option>
    );
  });
};
