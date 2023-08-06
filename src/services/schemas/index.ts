export function validateDate(date?: string): string | undefined {
  if (date === undefined) return undefined;
  if (!date.match("^([0-9]{4})-([0-9]{2})-([0-9]{2})$")) return undefined;
  return date;
}

export function validateNumber(num?: string): number | undefined {
  if (num === undefined) return undefined;
  return +num;
}

export function validateBoolean(bool?: string): boolean | undefined {
  if (bool === undefined) return undefined;
  return bool.toLowerCase() === "true";
}
