export function validateDate(date?: string): string | undefined {
  if (date == undefined) return undefined;
  if (!date.match("([0-9]{4})-([0-9}{2})-([0-9]{2})")) return undefined;
  return date;
}

export function validateNumber(number?: string): number | undefined {
  if (number == undefined) return undefined;
  return +number;
}

export function validateBoolean(bool?: string): boolean | undefined {
  if (bool == undefined) return undefined;
  return bool.toLowerCase() == "true";
}
