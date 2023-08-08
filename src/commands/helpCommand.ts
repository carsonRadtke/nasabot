import { Message } from "discord.js";
import { AbstractCommand } from "./abstractCommand";

function usage() {
  return [
    "Usage:",
    "apod [date=<YYYY-MM-DD>] [start_date=<YYYY-MM-DD>] [end_date=<YYYY-MM-DD>] [count=<int>] [thumbs=<true|false>]",
    " - astronomy photograph of the day",
    "help",
    " - display this message",
  ].join("\n");
}

export class HelpCommand extends AbstractCommand {
  respond(message: Message<boolean>, _: string[]): Promise<Message<boolean>> {
    return message.reply(usage());
  }
}
