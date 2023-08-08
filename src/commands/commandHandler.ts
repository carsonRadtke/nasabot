import { AbstractCommand } from "./abstractCommand";

export class CommandHandler {
  private commands: { [name: string]: AbstractCommand } = {};

  constructor(
    private defaultCommand: AbstractCommand,
  ) {
    this.registerCommand(defaultCommand);
  }

  registerCommand(command: AbstractCommand): void {
    if (this.commands[command.getName()] !== undefined)
      throw new Error("Command name already registered");
    this.commands[command.getName()] = command;
  }

  handle(name: string): AbstractCommand {
    return this.commands[name] ?? this.defaultCommand;
  }
}
