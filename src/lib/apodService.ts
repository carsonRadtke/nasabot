import { BotEnv } from "./environ";

const APODUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?apid_key=${BotEnv.NASAAPIToken}`;

class APODResponse {
  public date?: string = undefined;
  public post_id?: number = undefined;
  public title?: string = undefined;
  public permalink?: string = undefined;
  public media_type?: string = undefined;
  public explanation?: string = undefined;
  public credit?: string = undefined;
  public copyright?: string = undefined;
  public alt?: string = undefined;
  public url?: string = undefined;
  public hdurl?: string = undefined;
  public basic_html?: string = undefined;
  public basic_html_url?: string = undefined;
  static FromJSON(json: any): APODResponse[] {
    return Object.setPrototypeOf(
      json,
      APODResponse.prototype,
    ) as APODResponse[];
  }

  Render(): string {
    try {
      return [
        `**${this.title}** ${this.date}`,
        `> ${this.alt}`,
        `${this.explanation}`,
        `&copy; ${this.copyright}`,
        `${this.hdurl}`,
        `More info: ${this.permalink}`,
      ].join("\n");
    } catch (ex) {
      return `${ex}`;
    }
  }
}

class APODRequestCache {
  private static CachedValue?: Promise<string> = undefined;
  private static LastUpdated?: Date = undefined;

  private static ValidCache(): boolean {
    if (APODRequestCache.CachedValue === undefined) return false;
    if (APODRequestCache.LastUpdated === undefined) return false;
    const now = new Date();
    if (now.getDay() !== APODRequestCache.LastUpdated.getDay()) return false;
    return true;
  }

  private static async MakeRequestHelper(): Promise<string> {
    const response = await fetch(APODUrl);
    if (response.ok) {
      const json = await response.json();
      return APODResponse.FromJSON(json)[0].Render();
    } else {
      return `Failed to retrieve Astronomy Picture of the Day. (${response.status}: ${response.statusText}\n src: ${APODUrl})`;
    }
  }

  public static MakeRequest(cacheBuster: boolean = false): Promise<string> {
    if (cacheBuster || !APODRequestCache.ValidCache()) {
      APODRequestCache.LastUpdated = new Date();
      APODRequestCache.CachedValue = APODRequestCache.MakeRequestHelper();
    }
    return APODRequestCache.CachedValue!;
  }
}

export async function MakeAPODRequest(): Promise<string> {
  return APODRequestCache.MakeRequest();
}
