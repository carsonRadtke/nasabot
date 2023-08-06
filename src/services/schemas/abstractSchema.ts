export abstract class AbstractRequestSchema {
  protected apiKey: string;
  constructor() {
    this.apiKey = "DEMO_KEY";
  }
  queryParams(): string {
    return "?api_key=" + this.apiKey;
  }
}
export abstract class AbstractResponseSchema {}
