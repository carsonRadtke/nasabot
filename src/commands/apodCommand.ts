import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "../services/schemas/abstractSchema";
import { AbstractAPICommand } from "./abstractCommand";
import { validateDate } from "../services/schemas";
import { NASAAPIRequest } from "../services/nasaAPIService";

class APODRequestSchema extends AbstractRequestSchema {
  private date?: string;

  constructor(dict: { [key: string]: string }) {
    super();
    this.date = validateDate(dict["date"]);
  }

  queryParams(): string {
    let rv = super.queryParams();
    if (this.date !== undefined) rv += `&date=${this.date}`;
    return rv;
  }
}

class APODResponseSchema extends AbstractResponseSchema {
  public copyright: string = "";
  public date: string = "";
  public explanation: string = "";
  public hdurl: string = "";
  // tslint:disable-next-line:variable-name
  public media_type: string = "";
  // tslint:disable-next-line:variable-name
  public service_version: string = "";
  public title: string = "";
  public url: string = "";
}

export class APODCommand extends AbstractAPICommand {
  constructor() { super("apod"); }
  buildRequest(argv: string[]): APODRequestSchema {
    const argvDict: { [key: string]: string } = {};
    for (const arg of argv) {
      if (!arg.includes("=")) return new APODRequestSchema({});
      const [key, ...values] = arg.split("=");
      argvDict[key] = values.join("=");
    }
    return new APODRequestSchema(argvDict);
  }

  async makeRequest(request: APODRequestSchema): Promise<APODResponseSchema> {
    return NASAAPIRequest<APODRequestSchema, APODResponseSchema>(
      "/planetary/apod",
      request,
      APODRequestSchema.prototype,
    );
  }

  buildResponse(response: APODResponseSchema): string {
    const copyright =
      response.copyright === undefined ? "" : `by ${response.copyright}`;
    return [
      `${response.title} ${copyright}`,
      response.explanation,
      response.hdurl,
    ].join("\n");
  }
}
