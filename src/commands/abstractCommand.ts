import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "../services/schemas/abstractSchema";
import * as Discord from "discord.js";
import { ErrorResponseSchema } from "../services/schemas/errorSchema";

export abstract class AbstractCommand {
  constructor(private name: string) { }
  public getName(): string { return this.name; }
  abstract respond(
    message: Discord.Message<boolean>,
    argv: string[],
  ): Promise<Discord.Message<boolean>>;
}

export abstract class AbstractAPICommand extends AbstractCommand {
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
    let response: AbstractResponseSchema;
    try {
      response = await this.makeRequest(request);
    } catch (err: unknown) {
      const errorRes = err as ErrorResponseSchema;
      return message.reply(`Error: ${errorRes.msg}`);
    }
    const payload = this.buildResponse(response);
    return message.reply(payload);
  }
}
