import * as Discord from "discord.js";
import * as Proc from "node:process";
import * as readline from "node:readline/promises";
import { BotEnv } from "./lib/environ.ts";
import { MakeAPODRequest } from "./lib/apodService.ts";
import { CanSendOnChannel } from "./lib/discordUtil.ts";
import {
  AcceptedEnrollment,
  SubscriptionManagerCleanup,
  SubscriptionManagerInitialize,
  Unsubscribe,
} from "./lib/subscriptionManager.ts";
import {
  CommandKind,
  type CommandResult,
  HandleCommand,
} from "./lib/commandHandler.ts";

const Commands: {
  [command: string]: {
    description: string;
    handler: (result: CommandResult, msg?: Discord.Message) => Promise<Discord.MessageReplyOptions | string>;
  };
} = {};

async function ReplyWithAPOD(_res: CommandResult) {
  return await MakeAPODRequest();
}

async function ReplyWithEnrollment(
  _: CommandResult,
  msg?: Discord.Message,
) {
  if (msg === undefined) {
    throw "No Discord.Message provided";
  }
  const { channel } = msg;
  if (CanSendOnChannel(channel)) {
    if (AcceptedEnrollment(channel.id)) {
      await channel.send("This channel will receive daily APOD updates!");
    } else {
      await channel.send(
        "This channel is already subscribed to daily APOD updates.",
      );
    }
    return "Channel Enrolled";
  }
  return "Failed to enroll channel";
}

async function ReplyWithUnenrollment(
  _: CommandResult,
  msg?: Discord.Message,
) {
  if (msg === undefined) {
    throw "No Discord.Message provided";
  }
  const { channel } = msg;
  if (CanSendOnChannel(channel)) {
    if (Unsubscribe(channel.id)) {
      await channel.send(
        "This channel will no longer receive daily APOD updates!",
      );
    } else {
      await channel.send(
        "This channel is not subscribed to daily APOD updates.",
      );
    }
    return "Channel unenrolled";
  }
  return "Failed to unenroll channel";
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

async function ReplyWithHelp(res: CommandResult) {
  return HelpMessage(res.command);
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
  Commands[CommandKind.Unsubscribe] = {
    description: "Unsubscribe from daily APOD updates",
    handler: ReplyWithUnenrollment,
  };
}

function StartDiscordBot() {
  const Client = new Discord.Client({
    intents: ["DirectMessages", "GuildMessages", "Guilds", "MessageContent"],
    partials: [Discord.Partials.Message, Discord.Partials.Channel],
  });

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
      try {
        const command = HandleCommand(content);
        const response = await (Commands[command.kind] ?? Commands[CommandKind.Help]!).handler(command);
        await msg.reply(response);
      } catch (ex) {
        await msg.reply(`uncaught exception: ${ex}`);
      }
    }
  });

  Client.on(Discord.Events.Error, (err: Error) => {
    // TODO @(carsonradtke): Can I broadcast this error somewhere? Can I report it via an Azure resource?
    console.error(err);
  });

  Client.login(BotEnv.DiscordBotAPIToken).then(async () => {
    SubscriptionManagerInitialize(Client);
  }); }

async function StartLocalBot() {
  const rl = readline.createInterface({ input: Proc.stdin, output: Proc.stdout })
  while (true) {
    const content = await rl.question("> ")
    const command = HandleCommand(content)
    console.log(content)
    console.log(command)
    const response = await (Commands[command.kind] ?? Commands[CommandKind.Help]!).handler(command);
    console.log(JSON.stringify(response, undefined, 2));
  }
}

function Main() {
  InitializeCommands();
  if (BotEnv.DiscordBotAPIToken === undefined) {
    StartLocalBot();
  }
  else {
    StartDiscordBot();
  }
}

Main();
