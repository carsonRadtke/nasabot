import * as Discord from "discord.js";
import * as Process from "node:process";
import * as ArgParse from "./argparse";
import * as Commands from "./commands";

const client = new Discord.Client({
  intents: [
    /* TODO (@cradtke) */
  ],
});

client.on("ready", (client: Discord.Client<true>) => {
  console.log(client);
});

client.on("messageCreate", (message: Discord.Message<boolean>) => {
  const { content } = message;
  if (content.startsWith("./nasa "))
    Commands.handle(message, ArgParse.parse(content));
});

() => {
  const token = Process.env["NASABOT_TOKEN"];
  if (token == undefined) {
    console.error("Could not find NASABOT_TOKEN environment variable");
    Process.exit(1);
  }
  client.login(token);
};
