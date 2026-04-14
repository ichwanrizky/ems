"use client";

type Option = {
  value: number | string;
  label: string;
};

type FilterSectionProps = {
  options: Option[];
  value?: number | string;
  onChange: (value: string) => void;
  className?: string;
};

export default function FilterSection({
  options,
  value,
  onChange,
  className = "form-select me-2",
}: FilterSectionProps) {
  return (
    <select
      className={className}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- SECTION --</option>
      {options?.map((item, index) => (
        <option value={item.value} key={index}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
