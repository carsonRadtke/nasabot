import { AbstractRequestSchema, AbstractResponseSchema } from "./schema";

export class APODRequestSchema extends AbstractRequestSchema {
  items(): { key: string; value: string }[] {
    throw new Error("Method not implemented.");
  }
}

export class APODResponseSchema extends AbstractResponseSchema {}
