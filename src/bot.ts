import * as Discord from "discord.js";
import * as Process from "node:process";
import * as ArgParse from "./argparse";
import * as Commands from "./commands";

const command_prefixes = ["./nasa"];

const client = new Discord.Client({
  intents: ["MessageContent", "Guilds", "DirectMessages", "GuildMessages"],
  partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

client.on(Discord.Events.ClientReady, (client: Discord.Client<true>) => {
  console.log("client ready");
});

client.on(Discord.Events.MessageCreate, (message: Discord.Message<boolean>) => {
  const { content } = message;
  if (!command_prefixes.some((pre) => content.startsWith(pre))) return;

  Commands.handle(message, ArgParse.parse(content));
});

client.login(Process.env["NASABOT_TOKEN"]);
