import "process";
import * as Discord from "discord.js";

const DiscordBotAPIToken = process.env["DISCORD_BOT_API_TOKEN"];
if (!DiscordBotAPIToken) {
  console.error("Error: Discord API Token is not provided. Exiting.");
  process.exit(1);
}

const Subscriptions: string[] = [];

const NASAAPIToken = process.env["NASA_API_TOKEN"];
if (!NASAAPIToken) {
  console.error("Error: NASA API Token is not provided. Exiting.");
  process.exit(1);
}

const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASAAPIToken}`;

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

async function ReplyWithAPOD(msg: Discord.Message, _args: string[]) {
  const response = await fetch(APOD_URL);
  const json = await response.json();
  const reply_contents = BuildAPODReply(json);
  await msg.reply(reply_contents);
}

async function ReplyWithEnrollment({ channel }: Discord.Message, _args: string[]) {
  if (channel instanceof Discord.TextChannel) {
    if (Subscriptions.includes(channel.id)) {
      await channel.send("This channel is already subscribed to daily updates.");
    } else {
      Subscriptions.push(channel.id);
      await channel.send("This channel will receieve daily APOD updates!");
    }
  }
}

async function ReplyWithRestart(msg: Discord.Message, _args: string[]): Promise<never> {
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
  // TODO (@cradtke): NYI - Need to load subscriptions from a database for persistence.
}

function StartSubscriptionTimer() {
  const secondsToMidnight = (24 * 60 * 60) - (new Date().getTime() / 1000) % (24 * 60 * 60);
  setTimeout(async () => {
    const response = await fetch(APOD_URL);
    const json = await response.json();
    const reply_contents = BuildAPODReply(json);
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

