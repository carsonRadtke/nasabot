import { MessagePayload } from "discord.js";
import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "../services/schemas/abstractSchema";
import { AbstractCommand } from "./abstractCommand";
import {
  validateBoolean,
  validateDate,
  validateNumber,
} from "../services/schemas";
import { NASAAPIRequest } from "../services/nasaAPIService";

class APODRequestSchema extends AbstractRequestSchema {
  private date?: string;
  private start_date?: string;
  private end_date?: string;
  private count?: number;
  private thumbs?: boolean;

  constructor(dict: { [key: string]: string }) {
    super();
    this.date = validateDate(dict["date"]);
    this.start_date = validateDate(dict["start_date"]);
    this.end_date = validateDate(dict["end_date"]);
    this.count = validateNumber(dict["count"]);
    this.thumbs = validateBoolean(dict["thumbs"]);
  }

  queryParams(): string {
    let rv = super.queryParams();
    if (this.date != undefined) rv += "&date=" + this.date;
    if (this.start_date != undefined) rv += "&start_date=" + this.start_date;
    if (this.end_date != undefined) rv += "&end_date=" + this.end_date;
    if (this.count != undefined) rv += "&count=" + this.count;
    if (this.thumbs != undefined) rv += "&thumbs=" + this.thumbs;
    return rv;
  }
}

class APODResponseSchema extends AbstractResponseSchema {
  public copyright: string = "";
  public date: string = "";
  public explanation: string = "";
  public hdurl: string = "";
  public media_type: string = "";
  public service_version: string = "";
  public title: string = "";
  public url: string = "";

  constructor(json: { [key: string]: string }) {
    super();
    this.copyright = json["copyright"];
    this.date = json["date"];
    this.explanation = json["explanation"];
    this.hdurl = json["hdurl"];
    this.media_type = json["media_type"];
    this.service_version = json["service_version"];
    this.title = json["title"];
    this.url = json["url"];
  }
}

export class APODCommand extends AbstractCommand {
  buildRequest(argv: string[]): APODRequestSchema {
    let argv_dict: { [key: string]: string } = {};
    for (const arg of argv) {
      if (!arg.includes("=")) throw new Error("arg did not contain errors");
      const [key, ...values] = arg.split("=");
      argv_dict[key] = values.join("=");
    }
    return new APODRequestSchema(argv_dict);
  }

  async makeRequest(request: APODRequestSchema): Promise<APODResponseSchema> {
    return NASAAPIRequest<APODRequestSchema, APODResponseSchema>(
      "/planetary/apod",
      request,
      APODRequestSchema.prototype,
    );
  }

  buildResponse(response: APODResponseSchema): string {
    return [
      response.title + " by " + response.copyright,
      response.explanation,
      response.hdurl,
    ].join("\n");
  }
}
