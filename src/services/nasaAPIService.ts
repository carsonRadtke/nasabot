import { APODRequestSchema } from "./schemas/apodSchema";
import {
  AbstractRequestSchema,
  AbstractResponseSchema,
} from "./schemas/schema";

function buildURL(
  root: string,
  endpoint: string,
  params: AbstractRequestSchema,
): string {
  let paramsSuffix = "?api_key=DEMO_KEY&";
  for (const { key, value } of params.items())
    paramsSuffix += key + "=" + value + "&";
  paramsSuffix = paramsSuffix.substring(0, paramsSuffix.length - 1);
  return root + endpoint + paramsSuffix;
}

function NASARequest<T extends AbstractResponseSchema>(
  endpoint: string,
  queryParams: AbstractRequestSchema,
): T | undefined {
  const url = buildURL("https://api.nasa.gov/", endpoint, queryParams);
  return undefined;
}

export function APODRequest(schema: APODRequestSchema | undefined): APODRequestSchema | undefined {
  return NASARequest<APODRequestSchema>("planetary/apod", schema ?? {} as APODRequestSchema);
}
