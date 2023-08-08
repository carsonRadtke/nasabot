import { AbstractResponseSchema } from "./abstractSchema";

export class ErrorResponseSchema extends AbstractResponseSchema {
  public code: number = -1;
  public msg: string = "";
  // tslint:disable-next-line:variable-name
  public service_version: string = "";
}
