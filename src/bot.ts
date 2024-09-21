import "process";
import * as Discord from "discord.js";
import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";

const GetRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
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

function BuildAPODReply(json: any): string {
  return [
    `**${json.title}** (${json.date})`,
    `${json.explanation}`,
    `${json.copyright}`,
    `${json.hdurl ?? json.url}`,
  ]
    .filter((x) => x !== undefined)
    .join("\n");
}

async function MakeAPODRequest(): Promise<any> {
  // TODO (@cradtke): This changes everyday at midnight (timezone?); cache it.
  const response = await fetch(APODUrl);
  const json = await response.json();
  return BuildAPODReply(json);
};

async function ReplyWithAPOD(msg: Discord.Message, _args: string[]) {
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

async function ReplyWithEnrollment({ channel }: Discord.Message, _args: string[]) {
  if (channel instanceof Discord.TextChannel) {
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

async function ReplyWithRestart(msg: Discord.Message, _args: string[]): Promise<never> {
  // TODO (@cradtke): How can I make sure only an authorized sender can invoke this?
  await msg.reply("Restarting...")
  process.exit(1);
}

async function ReplyWithHelp(msg: Discord.Message, _args: string[]) {
  await msg.reply(HelpMessage());
}

const Commands: { [command: string]: { hidden: boolean, description: string, handler: (msg: Discord.Message, args: string[]) => Promise<void> } } = {
  "subscribe": { hidden: false, description: "Subscribe to daily APOD updates", handler: ReplyWithEnrollment },
  "apod": { hidden: false, description: "Get the Astronomy Picture of the Day", handler: ReplyWithAPOD },
  "help": { hidden: false, description: "Show this help message", handler: ReplyWithHelp },
  "!!!restart!!!": { hidden: true, description: "Restart the bot", handler: ReplyWithRestart },
}

function HelpMessage(): string {
  return [
    "```",
    `Usage: ${process.argv[1]} <command> [args...]`,
    `Available commands:`,
    ...Object.entries(Commands).filter(([_, { hidden }]) => !hidden).map(([cmd, { description }]) => `\t- ${cmd}: ${description}`),
    "```",
  ].join("\n");
}

async function HandleMessage(msg: Discord.Message) {
  const [_, subcommand, ...args] = msg.content.split(" ").map(x => x.trim());
  const handler = Commands[subcommand];
  if (handler) {
    await handler.handler(msg, args);
  } else {
    await msg.reply(HelpMessage());
  }
}

const Client = new Discord.Client({
  intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
  partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

Client.on(Discord.Events.ClientReady, (cli: Discord.Client) => {
  console.info(`Connected as ${cli.user?.tag}`);
});

Client.on(Discord.Events.MessageCreate, async (msg: Discord.Message) => {
  const { content } = msg;
  if (content.startsWith("./nasabot")) {
    if (msg.channel instanceof Discord.TextChannel) {
      msg.channel.sendTyping();
    }
    await HandleMessage(msg);
  }
});

async function LoadSubscriptions() {
  const client = getTableClient();
  const entity = await client.getEntity("", "");
  const channels: string = entity.SubscribedChannels as string;
  Subscriptions.push(...JSON.parse(channels));
  for (const subscription of Subscriptions) {
    const channel = await Client.channels.fetch(subscription);
    if (channel instanceof Discord.TextChannel) {
      await channel.send("I'm back! I'll continue to send daily updates here.");
    }
  }
}

function StartSubscriptionTimer() {
  const secondsToMidnight = (24 * 60 * 60) - (new Date().getTime() / 1000) % (24 * 60 * 60);
  setTimeout(async () => {
    const reply_contents = await MakeAPODRequest();
    for (const subscription of Subscriptions) {
      const channel = await Client.channels.fetch(subscription);
      if (channel instanceof Discord.TextChannel) {
        await channel.send(reply_contents);
      }
    }
    StartSubscriptionTimer();
  }, secondsToMidnight * 1000);
}

Client.login(DiscordBotAPIToken).then(async () => {
  await LoadSubscriptions();
  StartSubscriptionTimer();
});

