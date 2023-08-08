import * as Discord from "discord.js";
import * as ArgParse from "./argparse";
import * as Commands from "./commands";
import { getEnv } from "./services/environ";

const commandPrefixes = ["./nasa"];

const client = new Discord.Client({
  intents: ["MessageContent", "Guilds", "DirectMessages", "GuildMessages"],
  partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

client.on(Discord.Events.ClientReady, (_cli: Discord.Client<true>) => {
  // tslint:disable-next-line:no-console
  console.log("client ready");
  client.user?.setActivity("try `./nasa help`");
});

client.on(Discord.Events.MessageCreate, (message: Discord.Message<boolean>) => {
  const { content } = message;
  if (!commandPrefixes.some((pre) => content.startsWith(pre))) return;

  Commands.handle(message, ArgParse.parse(content));
});

client.login(getEnv("NASABOT_TOKEN"));
