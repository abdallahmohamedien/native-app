export const toEn = (num: string | number): string => {
  if (num === undefined || num === null) return "---";
  return num
    .toString()
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};
