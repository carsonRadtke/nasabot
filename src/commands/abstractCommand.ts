export abstract class AbstractCommand {
  abstract response(argv: string[]): string | undefined;
  abstract parseArgv<T>(argv: string[]): T | undefined;
}
