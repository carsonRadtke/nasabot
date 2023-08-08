import { Message } from "discord.js";
import { AbstractCommand } from "./abstractCommand";

const USAGE_MSG = `
\`\`\`
Usage: ./nasa <command> <argv0> <argv1> ... <argvN>
Options for <command>:
  - \`apod\`: Display the Astronomy Picture of the Day
   -- Arguments:
    --- [date=<date>] The date of the image to retrieve
  - \`ping\`: Bot will reply with "pong"
  - \`help\`: Display this message
\`\`\``;

export class HelpCommand extends AbstractCommand {
  respond(message: Message<boolean>, _: string[]): Promise<Message<boolean>> {
    return message.reply(USAGE_MSG);
  }
}
