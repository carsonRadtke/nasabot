import * as Discord from "discord.js";

import { CommandHandler } from "./commandHandler";
import { APODCommand } from "./apodCommand";

const commandHandler = new CommandHandler();
commandHandler.registerCommand("apod", new APODCommand());

export function dispatchCommand(
  message: Discord.Message<boolean>,
  command: string,
  argv: string[],
) {
  const response = commandHandler.handle(command).response(argv);
  message.reply(response ?? "error");
}

export function handle(
  message: Discord.Message<boolean>,
  argv: string[],
): void {
  const [_, subcommand, ...subcommand_argv] = argv;
  dispatchCommand(message, subcommand, subcommand_argv);
}
