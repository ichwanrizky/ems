import React from "react";

export const FilterTahun = () => {
  return Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year >= 2024 ? (
      <option value={year} key={i}>
        {year}
      </option>
    ) : null;
  });
};
