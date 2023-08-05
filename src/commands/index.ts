import * as Discord from "discord.js";

import { CommandHandler } from "./commandHandler";
import { APODCommand } from "./apodCommand";

const nasaHandler = new CommandHandler();
nasaHandler.registerCommand("apod", new APODCommand());

export async function dispatchCommand(
  message: Discord.Message<boolean>,
  command: string,
  subcommand: string,
  argv: string[],
): Promise<undefined> {
  if (command == "./nasa")
    await nasaHandler.handle(subcommand).respond(message, argv);
}

export async function handle(
  message: Discord.Message<boolean>,
  argv: string[],
): Promise<undefined> {
  message.channel.sendTyping();
  const [command, subcommand, ...subcommand_argv] = argv;
  await dispatchCommand(message, command, subcommand, subcommand_argv);
}
