import * as Discord from "discord.js";
import * as ArgParse from "./argparse";
import * as Commands from "./commands";
import * as Cron from "node-cron";
import { getEnv } from "./services/environ";
import { APODCommand } from "./commands/apodCommand";

const commandPrefixes = ["./nasa"];

const client = new Discord.Client({
  intents: ["MessageContent", "Guilds", "DirectMessages", "GuildMessages"],
  partials: [Discord.Partials.Message, Discord.Partials.Channel],
});

client.on(Discord.Events.ClientReady, (_cli: Discord.Client<true>) => {
  // tslint:disable-next-line:no-console
  console.log("client ready");
  client.user?.setActivity("try `./nasa help`");
  if (getEnv("APOD_CHANNEL", "") !== "") {
    Cron.schedule("0 5 * * *", () => {
      client.channels
        .fetch(getEnv("APOD_CHANNEL"))
        .then((channel: Discord.Channel | null) => {
          if (channel?.isTextBased()) {
            const dmChannel = channel as Discord.TextChannel;
            new APODCommand().getResponse([]).then((text: string) => {
              dmChannel.send(text);
            });
          }
        });
    });
  }
});

client.on(Discord.Events.MessageCreate, (message: Discord.Message<boolean>) => {
  const { content } = message;
  if (!commandPrefixes.some((pre) => content.startsWith(pre))) return;

  Commands.handle(message, ArgParse.parse(content));
});

client.login(getEnv("NASABOT_TOKEN"));
