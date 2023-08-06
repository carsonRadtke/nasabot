function nextToken(
  command: string,
  start: number,
): { token: string; new_idx: number } {
  let end: number;
  if (command.charAt(start) == "'") {
    start += 1;
    end = command.indexOf("'", start);
    while (end > 0 && command.charAt(end - 1) == "\\")
      end = command.indexOf("'", end + 1);
    if (end == -1) return { token: "", new_idx: -1 };
  } else end = command.indexOf(" ", start);
  if (end == -1) end = command.length;
  let token = command.substring(start, end);
  while (token.includes("\\")) token = token.replace("\\", "");
  return { token: token, new_idx: end + 1 };
}

export function parse(command: string): string[] {
  const rv = [];
  let idx = 0;
  while (idx < command.length) {
    let { token, new_idx } = nextToken(command, idx);
    rv.push(token.trim());
    idx = new_idx;
    if (idx == -1) return [];
  }
  return rv;
}
