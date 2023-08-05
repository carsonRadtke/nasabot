import { AbstractCommand } from "./abstractCommand";

export class CommandHandler {
  private commands: { [name: string]: AbstractCommand } = {};

  constructor(private defaultName: string, defaultCommand: AbstractCommand)
  {
    this.registerCommand(this.defaultName, defaultCommand);
  }

  registerCommand(name: string, command: AbstractCommand): void {
    if (this.commands[name] != undefined)
      throw new Error("Command name already registered");
    this.commands[name] = command;
  }

  handle(name: string): AbstractCommand {
    return this.commands[name] ?? this.commands[this.defaultName];
  }
}
