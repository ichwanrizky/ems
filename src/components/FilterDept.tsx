"use client";

type Option = {
  value: number | string;
  label: string;
};

type FilterDeptProps = {
  options: Option[];
  value?: number | string;
  onChange: (value: string) => void;
  className?: string;
};

export default function FilterDept({
  options,
  value,
  onChange,
  className = "form-select me-2",
}: FilterDeptProps) {
  return (
    <select
      className={className}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- DEPT --</option>
      {options?.map((item, index) => (
        <option value={item.value} key={index}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
