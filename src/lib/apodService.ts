import * as Discord from "discord.js";
import { BotEnv } from "./environ.ts";
import TurndownService from "turndown";

const APODUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?apid_key=${BotEnv.NasaApiToken}`;
const NasaThumbnail =
  "https://science.nasa.gov/wp-content/themes/nasa-child/assets/images/nasa-logo@2x.png";

function extractAuthorInfo(authorString: string): Discord.APIEmbedAuthor {
  // authorString is either `<a href="${url}">${name}</a>` or `${name}`
  const re = /<a href="([^"]*)">([^<]*)<\/a>/;
  const match_pool = authorString.match(re);
  if (match_pool === null || match_pool[1] === null || match_pool[2] == null) {
    return { name: authorString };
  }
  return { name: match_pool[2]!, url: match_pool[1]! };
}

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
    let turndownService = new TurndownService();
    return {
      embeds: [
        new Discord.EmbedBuilder()
          .setTitle(this.title)
          .setURL(this.permalink)
          .setThumbnail(NasaThumbnail)
          .setAuthor(extractAuthorInfo(this.credit))
          .setDescription(turndownService.turndown(this.explanation))
          .setImage(this.hdurl)
          .setTimestamp(new Date(this.date))
          .setFooter({ text: this.alt }),
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
      const json = (await response.json()) as any[];
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
