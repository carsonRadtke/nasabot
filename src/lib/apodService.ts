import * as Discord from "discord.js";
import { BotEnv } from "./environ";

const APODUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?apid_key=${BotEnv.NASAAPIToken}`;

class APODResponse {
  public date: string = "";
  public post_id: number = -1;
  public title: string = "";
  public permalink: string = "";
  public media_type: string = "";
  public explanation: string = "";
  public credit: string = "";
  public copyright: string = "";
  public alt: string = "";
  public url: string = "";
  public hdurl: string = "";
  public basic_html: string = "";
  public basic_html_url: string = "";
  static FromJSON(json: any): APODResponse {
    return Object.setPrototypeOf(json, APODResponse.prototype) as APODResponse;
  }

  Render(): Discord.MessageReplyOptions {
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setTitle(this.title)
          .setURL(this.permalink)
          .setAuthor({ name: this.credit })
          .setDescription(this.explanation!)
          .setThumbnail(this.url)
          .setImage(this.hdurl)
          .setTimestamp(new Date(this.date)),
      ],
    };
  }
}

class APODRequestCache {
  private static CachedValue?: Promise<Discord.MessageReplyOptions> = undefined;
  private static LastUpdated?: Date = undefined;

  private static ValidCache(): boolean {
    if (APODRequestCache.CachedValue === undefined) return false;
    if (APODRequestCache.LastUpdated === undefined) return false;
    const now = new Date();
    if (now.getDay() !== APODRequestCache.LastUpdated.getDay()) return false;
    return true;
  }

  private static async MakeRequestHelper(): Promise<Discord.MessageReplyOptions> {
    const response = await fetch(APODUrl);
    if (response.ok) {
      const json = await response.json();
      return APODResponse.FromJSON(json[0]).Render();
    } else {
      return {
        content: `Failed to retrieve Astronomy Picture of the Day. (${response.status}: ${response.statusText}\n src: ${APODUrl})`,
      };
    }
  }

  public static MakeRequest(
    cacheBuster: boolean = false,
  ): Promise<Discord.MessageReplyOptions> {
    if (cacheBuster || !APODRequestCache.ValidCache()) {
      APODRequestCache.LastUpdated = new Date();
      APODRequestCache.CachedValue = APODRequestCache.MakeRequestHelper();
    }
    return APODRequestCache.CachedValue!;
  }
}

export async function MakeAPODRequest(): Promise<Discord.MessageReplyOptions> {
  return APODRequestCache.MakeRequest();
}
