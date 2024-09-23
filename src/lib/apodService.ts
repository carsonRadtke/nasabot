import { BotEnv } from "./environ";

const APODUrl = `https://api.nasa.gov/planetary/apod?api_key=${BotEnv.NASAAPIToken}`;

class APODResponse {
    public copyright?: string = undefined;
    public date?: string = undefined;
    public explanation?: string = undefined;
    public hdurl?: string = undefined;
    public media_type?: string = undefined;
    public service_version?: string = undefined;
    public title?: string = undefined;
    public url?: string = undefined;

    static FromJSON(json: any): APODResponse {
        return Object.setPrototypeOf(json, APODResponse.prototype) as APODResponse;
    }

    Render(): string {
        return [
            `**${this.title}** (${this.date})`,
            `${this.explanation}`,
            `${this.copyright}`,
            `${this.hdurl ?? this.url}`,
        ].join("\n");
    }
};

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
            return APODResponse.FromJSON(json).Render();
        } else {
            return `Failed to retrieve Astronomy Picture of the Day. (${response.status}: ${response.statusText})`;
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