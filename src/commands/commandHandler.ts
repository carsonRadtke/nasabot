import { AbstractCommand } from "./abstractCommand";

export class CommandHandler {
  private commands: { [name: string]: AbstractCommand } = {};

  registerCommand(name: string, command: AbstractCommand): void {
    if (this.commands[name] != undefined)
      throw new Error("Command name already registered");
    this.commands[name] = command;
  }

  handle(name: string): AbstractCommand {
    if (this.commands[name] == undefined)
      throw new Error("Command not registered");
    return this.commands[name];
  }
}
