import * as Discord from "discord.js";

import { CommandHandler } from "./commandHandler";
import { APODCommand } from "./apodCommand";
import { HelpCommand } from "./helpCommand";
import { PingCommand } from "./pingCommand";

const nasaHandler = new CommandHandler("help", new HelpCommand());
nasaHandler.registerCommand("apod", new APODCommand());
nasaHandler.registerCommand("ping", new PingCommand());

export async function dispatchCommand(
  message: Discord.Message<boolean>,
  command: string,
  subcommand: string,
  argv: string[],
): Promise<undefined> {
  if (command === "./nasa")
    await nasaHandler.handle(subcommand).respond(message, argv);
}

export async function handle(
  message: Discord.Message<boolean>,
  argv: string[],
): Promise<undefined> {
  message.channel.sendTyping();
  const [command, subcommand, ...subcommandArgv] = argv;
  await dispatchCommand(message, command, subcommand, subcommandArgv);
}
