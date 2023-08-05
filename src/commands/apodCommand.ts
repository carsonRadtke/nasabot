import { APODRequest } from "../services/nasaAPIService";
import { AbstractCommand } from "./abstractCommand";

export class APODCommand extends AbstractCommand {
  override response(argv: string[]): string | undefined {
    const response = APODRequest(this.parseArgv(argv));
    return undefined;
  }

  override parseArgv<APODRequest>(argv: string[]): APODRequest | undefined {
    return undefined;
  }
}
