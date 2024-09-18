import "process";
import * as Discord from "discord.js";

const DiscordAPIToken = process.env["DISCORD_BOT_API_TOKEN"];
if (!DiscordAPIToken) {
  console.error("Error: Discord API Token is not provided. Exiting.");
  process.exit(1);
}

const NASAAPIToken = process.env["NASA_API_TOKEN"];
if (!NASAAPIToken) {
  console.error("Error: NASA API Token is not provided. Exiting.");
  process.exit(1);
}

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
  const response = await fetch(
    "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
  );
  const json = await response.json();
  const reply_contents = BuildAPODReply(json);
  await msg.reply(reply_contents);
}

async function HandleMessage(msg: Discord.Message) {
  const [command, subcommand, ...args] = msg.content.split(" ");
  switch (subcommand) {
    case "apod":
      await ReplyWithAPOD(msg, args);
      break;
    case "exit":
      await msg.reply("Goodbye!");
      process.exit(0);
    case "help":
    case undefined:
    default:
      await msg.reply(`Usage: ${command} <subcommand> [<subcommand_args>]`);
      break;
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

Client.login(DiscordAPIToken);
