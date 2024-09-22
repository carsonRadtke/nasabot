import "process";
import * as Discord from "discord.js";
import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";

const GetRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    console.error(`Error: ${name} was not provided. Exiting.`);
    process.exit(1);
  }
  return value;
}

const DiscordBotAPIToken = GetRequiredEnvVar("DISCORD_BOT_API_TOKEN");
const NASAAPIToken = GetRequiredEnvVar("NASA_API_TOKEN");
const AzureAccount = GetRequiredEnvVar("AZURE_ACCOUNT");
const AzureAccountKey = GetRequiredEnvVar("AZURE_ACCOUNT_KEY");
const AzureTableName = GetRequiredEnvVar("AZURE_TABLE_NAME");

const APODUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASAAPIToken}`;
const Subscriptions: string[] = [];

class APODResponse {
  public copyright?: string = undefined;
  public date?: string = undefined;
  public explanation?: string = undefined;
  public hdurl?: string = undefined;
  public media_type?: string = undefined;
  public service_version?: string = undefined;
  public title?: string = undefined;
  public url?: string = undefined;

  public repr(): string {
    return [
      `**${this.title}** (${this.date})`,
      `${this.explanation}`,
      `${this.copyright}`,
      `${this.hdurl ?? this.url}`,
    ].join("\n");
  }
};

function CanSendOnChannel(channel: Discord.Channel) {
  return channel instanceof Discord.TextChannel || channel instanceof Discord.DMChannel;
}

function BuildAPODReply(json: APODResponse): string {
  return json.repr();
}

async function MakeAPODRequest(): Promise<string> {
  // TODO (@cradtke): This changes everyday at midnight (timezone?); cache it.
  const response = await fetch(APODUrl);
  if (response.ok) {
    const data = await response.json() as APODResponse;
    return BuildAPODReply(data);
  } else {
    return `Failed to retrieve Astronomy Picture of the Day. (${response.status}: ${response.statusText})`;
  }
};

async function ReplyWithAPOD(msg: Discord.Message) {
  const reply_contents = await MakeAPODRequest();
  await msg.reply(reply_contents);
}

function getTableClient(): TableClient {
  const credential = new AzureNamedKeyCredential(AzureAccount, AzureAccountKey);
  const url = `https://${AzureAccount}.table.core.windows.net`;
  return new TableClient(url, AzureTableName, credential);
}

async function FlushSubscriptions() {
  const client = getTableClient();
  await client.updateEntity({ partitionKey: "", rowKey: "", SubscribedChannels: JSON.stringify(Subscriptions) }, "Replace");
}

async function ReplyWithEnrollment({ channel }: Discord.Message) {
  if (CanSendOnChannel(channel)) {
    if (Subscriptions.includes(channel.id)) {
      await channel.send("This channel is already subscribed to daily updates.");
    } else {
      Subscriptions.push(channel.id);
      // TODO (@cradtke): This is not efficient; we should batch these up.
      await FlushSubscriptions();
      await channel.send("This channel will receive daily APOD updates!");
    }
  }
}

async function ReplyWithRestart(msg: Discord.Message): Promise<never> {
  // TODO (@cradtke): How can I make sure only an authorized sender can invoke this?
  //                  ...Without having to hard-code the user ID?
  await msg.reply("Restarting...")
  process.exit(1);
}

async function ReplyWithHelp(msg: Discord.Message) {
  await msg.reply(HelpMessage());
}

const Commands: { [command: string]: { hidden: boolean, description: string, handler: (msg: Discord.Message) => Promise<void> } } = {
  "subscribe": { hidden: false, description: "Subscribe to daily APOD updates", handler: ReplyWithEnrollment },
  "apod": { hidden: false, description: "Get the Astronomy Picture of the Day", handler: ReplyWithAPOD },
  "help": { hidden: false, description: "Show this help message", handler: ReplyWithHelp },
  "!!!restart!!!": { hidden: true, description: "Restart the bot", handler: ReplyWithRestart },
}

function HelpMessage(): string {
  return [
    "```",
    `Usage: ${process.argv[1]} <command>`,
    `Available commands:`,
    ...Object.entries(Commands).filter(([_, { hidden }]) => !hidden).map(([cmd, { description }]) => `\t- ${cmd}: ${description}`),
    "```",
  ].join("\n");
}

async function HandleMessage(msg: Discord.Message) {
  const [_, subcommand] = msg.content.split(" ").map(x => x.trim());
  const handler = Commands[subcommand];
  if (handler) {
    await handler.handler(msg);
  } else {
    await msg.reply(HelpMessage());
  }
}

async function LoadSubscriptions() {
  const client = getTableClient();
  const entity = await client.getEntity("", "");
  const channels: string = entity.SubscribedChannels as string;
  Subscriptions.push(...JSON.parse(channels));
  for (const subscription of Subscriptions) {
    const channel = await Client.channels.fetch(subscription);
    if (channel !== null && CanSendOnChannel(channel)) {
      await channel.send("I'm back! I'll continue to send daily updates here.");
    }
  }
}

function StartSubscriptionTimer() {
  // TODO (@cradtke): This is time-zone dependent; currently midnight UTC.
  const secondsToMidnight = (24 * 60 * 60) - (new Date().getTime() / 1000) % (24 * 60 * 60);
  setTimeout(async () => {
    const reply_contents = await MakeAPODRequest();
    for (const subscription of Subscriptions) {
      const channel = await Client.channels.fetch(subscription);
      if (channel !== null && CanSendOnChannel(channel)) {
        await channel.send(reply_contents);
      }
    }
    StartSubscriptionTimer();
  }, secondsToMidnight * 1000);
}

const Client = new Discord.Client({
  intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
  partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

Client.on(Discord.Events.ClientReady, (cli: Discord.Client) => {
  console.info(`Connected as ${cli.user?.tag}`);
  if (cli.user !== null) {
    cli.user.setActivity("nasabot", { type: Discord.ActivityType.Custom, state: "./nasabot help" });
  }
});

Client.on(Discord.Events.MessageCreate, async (msg: Discord.Message) => {
  const { content } = msg;
  if (content.startsWith("./nasabot")) {
    if (CanSendOnChannel(msg.channel)) {
      msg.channel.sendTyping();
    }
    await HandleMessage(msg);
  }
});

Client.login(DiscordBotAPIToken).then(async () => {
  await LoadSubscriptions();
  StartSubscriptionTimer();
});

