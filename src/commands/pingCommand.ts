import { Message } from "discord.js";
import { AbstractCommand } from "./abstractCommand";

export class PingCommand extends AbstractCommand {
  respond(message: Message<boolean>, _: string[]): Promise<Message<boolean>> {
    return message.reply("pong");
  }
}
