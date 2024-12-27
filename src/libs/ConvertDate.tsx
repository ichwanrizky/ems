export const ConvertDate = (date: Date) => {
  const currendDate = new Date(date);
  const formattedDate = new Date(currendDate);
  formattedDate.setHours(formattedDate.getHours() + 7);
  return formattedDate as Date;
};

export const DateMinus7Format = (date: Date) => {
  const currendDate = new Date(date);
  const formattedDate = new Date(currendDate);
  formattedDate.setHours(formattedDate.getHours() - 7);

  return formattedDate as Date;
};
