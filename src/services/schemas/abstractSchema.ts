export abstract class AbstractRequestSchema {
  protected api_key: string;
  constructor() {
    this.api_key = "DEMO_KEY";
  }
  queryParams(): string {
    return "?api_key=" + this.api_key;
  }
}
export abstract class AbstractResponseSchema {}
