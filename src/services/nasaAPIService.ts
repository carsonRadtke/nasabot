import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "./schemas/abstractSchema";
import { ErrorResponseSchema } from "./schemas/errorSchema";

const BASE_URL = "https://api.nasa.gov";

export async function NASAAPIRequest<
  Q extends AbstractRequestSchema,
  S extends AbstractResponseSchema,
>(endpoint: string, request: Q, proto: any): Promise<S> {
  const url = BASE_URL + endpoint + request.queryParams();
  const json = await (await fetch(url)).json();
  if (json["code"] !== undefined) {
    throw Object.create(
      ErrorResponseSchema.prototype,
      Object.getOwnPropertyDescriptors(json),
    ) as ErrorResponseSchema;
  }
  return Object.create(proto, Object.getOwnPropertyDescriptors(json)) as S;
}
