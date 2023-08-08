import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "../services/schemas/abstractSchema";
import { AbstractAPICommand } from "./abstractCommand";
import {
  validateBoolean,
  validateDate,
  validateNumber,
} from "../services/schemas";
import { NASAAPIRequest } from "../services/nasaAPIService";

class APODRequestSchema extends AbstractRequestSchema {
  private date?: string;
  private startDate?: string;
  private endDate?: string;
  private count?: number;
  private thumbs?: boolean;

  constructor(dict: { [key: string]: string }) {
    super();
    this.date = validateDate(dict["date"]);
    this.startDate = validateDate(dict["start_date"]);
    this.endDate = validateDate(dict["end_date"]);
    this.count = validateNumber(dict["count"]);
    this.thumbs = validateBoolean(dict["thumbs"]);
  }

  queryParams(): string {
    let rv = super.queryParams();
    if (this.date !== undefined) rv += `&date=${this.date}`;
    if (this.startDate !== undefined) rv += `&start_date=${this.startDate}`;
    if (this.endDate !== undefined) rv += `&end_date=${this.endDate}`;
    if (this.count !== undefined) rv += `&count=${this.count}`;
    if (this.thumbs !== undefined) rv += `&thumbs=${this.thumbs}`;
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
