import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "../services/schemas/abstractSchema";
import * as Discord from "discord.js";

export abstract class AbstractCommand {
  abstract respond(message: Discord.Message<boolean>, argv: string[]): Promise<Discord.Message<boolean>>;
}

export abstract class AbstractAPICommand extends AbstractCommand{
  abstract buildRequest(argv: string[]): AbstractRequestSchema;
  abstract makeRequest(
    request: AbstractResponseSchema,
  ): Promise<AbstractResponseSchema>;
  abstract buildResponse(response: AbstractResponseSchema): string;

  override async respond(
    message: Discord.Message<boolean>,
    argv: string[],
  ): Promise<Discord.Message<boolean>> {
    const request = this.buildRequest(argv);
    const response = await this.makeRequest(request);
    const payload = this.buildResponse(response);
    return message.reply(payload);
  }
}
