import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "./schemas/abstractSchema";

const BASE_URL = "https://api.nasa.gov";

export async function NASAAPIRequest<
  Q extends AbstractRequestSchema,
  S extends AbstractResponseSchema,
>(endpoint: string, request: Q, proto: any): Promise<S> {
  let url = BASE_URL + endpoint + request.queryParams();
  let json = await (await fetch(url)).json();
  return Object.create(proto, Object.getOwnPropertyDescriptors(json)) as S;
}
