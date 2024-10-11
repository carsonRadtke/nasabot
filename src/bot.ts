import * as Discord from "discord.js";
import { BotEnv } from "./lib/environ";
import { MakeAPODRequest } from "./lib/apodService";
import { CanSendOnChannel } from "./lib/discordUtil";
import {
  AcceptedEnrollment,
  SubscriptionManagerCleanup,
  SubscriptionManagerInitialize,
} from "./lib/subscriptionManager";
import {
  CommandKind,
  CommandResult,
  HandleCommand,
} from "./lib/commandHandler";

const Commands: {
  [command: string]: {
    description: string;
    handler: (result: CommandResult, message: Discord.Message) => Promise<void>;
  };
} = {};

async function ReplyWithAPOD(_res: CommandResult, msg: Discord.Message) {
  const reply_contents = await MakeAPODRequest();
  await msg.reply(reply_contents);
}

async function ReplyWithEnrollment(
  _res: CommandResult,
  { channel }: Discord.Message,
) {
  if (CanSendOnChannel(channel)) {
    if (AcceptedEnrollment(channel.id)) {
      await channel.send("This channel will receive daily APOD updates!");
    } else {
      await channel.send(
        "This channel is already subscribed to daily APOD updates.",
      );
    }
  }
}

function HelpMessage(command: string): string {
  return [
    "```",
    `Usage: ${command} <command>`,
    `Available commands:`,
    ...Object.entries(Commands).map(
      ([cmd, { description }]) => `\t- ${cmd}: ${description}`,
    ),
    "```",
  ].join("\n");
}

async function ReplyWithHelp(res: CommandResult, msg: Discord.Message) {
  await msg.reply(HelpMessage(res.command));
}

function InitializeCommands() {
  Commands[CommandKind.Subscribe] = {
    description: "Subscribe to daily APOD updates",
    handler: ReplyWithEnrollment,
  };
  Commands[CommandKind.APOD] = {
    description: "Get the Astronomy Picture of the Day",
    handler: ReplyWithAPOD,
  };
  Commands[CommandKind.Help] = {
    description: "Show this message",
    handler: ReplyWithHelp,
  };
}

function Main() {
  const Client = new Discord.Client({
    intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
    partials: [Discord.Partials.Message, Discord.Partials.Channel],
  });

  InitializeCommands();

  Client.on(Discord.Events.ClientReady, (cli: Discord.Client) => {
    console.info(`Connected as ${cli.user?.tag}`);
    if (cli.user !== null) {
      cli.user.setActivity("nasabot", {
        type: Discord.ActivityType.Custom,
        state: "./nasabot help",
      });
    }
    process.on("exit", async () => await SubscriptionManagerCleanup());
  });

  Client.on(Discord.Events.MessageCreate, async (msg: Discord.Message) => {
    const { content } = msg;
    if (content.startsWith("./nasabot")) {
      if (CanSendOnChannel(msg.channel)) {
        await msg.channel.sendTyping();
      }
      const command = HandleCommand(content);
      await (Commands[command.kind] ?? Commands[CommandKind.Help]).handler(
        command,
        msg,
      );
    }
  });

  Client.on(Discord.Events.Error, (err: Error) => {
    // TODO @(carsonradtke): Can I broadcast this error somewhere? Can I report it via an Azure resource?
    console.error(err);
  });

  Client.login(BotEnv.DiscordBotAPIToken).then(async () => {
    SubscriptionManagerInitialize(Client);
  });
}

if (BotEnv.CallMain !== "0") {
  Main();
}
