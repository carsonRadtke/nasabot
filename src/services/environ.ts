import * as Process from "node:process";

export function getEnv(name: string, revert?: string): string {
  const result = Process.env[name];
  if (result === undefined) {
    if (revert === undefined) {
      throw new Error(`Missing ${name} from environment.`);
    }
    return revert;
  }
  return result;
}
