export const DisplayHour: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "UTC",
};

export const DisplayDate: Intl.DateTimeFormatOptions = {
  timeZone: "UTC",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour12: false,
};

export const DisplayFullDate: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
};

export const DisplayMonthName = (month: number) => {
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

  return monthNames[month - 1];
};
