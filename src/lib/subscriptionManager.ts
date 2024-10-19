import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";
import { CanSendOnChannel } from "./discordUtil";
import { Client as DiscordBot } from "discord.js";
import { BotEnv } from "./environ";
import { MakeAPODRequest } from "./apodService";

const Subscriptions: string[] = [];

function getTableClient(): TableClient {
  const credential = new AzureNamedKeyCredential(
    BotEnv.AzureAccount,
    BotEnv.AzureAccountKey,
  );
  const url = `https://${BotEnv.AzureAccount}.table.core.windows.net`;
  return new TableClient(url, BotEnv.AzureTableName, credential);
}

async function LoadSubscriptions(bot: DiscordBot) {
  const client = getTableClient();
  const entity = await client.getEntity("", "");
  const channels: string = entity.SubscribedChannels as string;
  Subscriptions.push(...JSON.parse(channels));
  if (BotEnv.SkipHello === "0") {
    for (const subscription of Subscriptions) {
      const channel = await bot.channels.fetch(subscription);
      if (channel !== null && CanSendOnChannel(channel)) {
        await channel.send(
          "I'm back! I'll continue to send daily updates here.",
        );
      }
    }
  }
}

export function AcceptedEnrollment(channel: string): boolean {
  if (!Subscriptions.includes(channel)) {
    Subscriptions.push(channel);
    return true;
  }
  return false;
}

export function Unsubscribe(channel: string): boolean {
    const index = Subscriptions.indexOf(channel);
    if (index > -1) {
        Subscriptions.splice(index, 1);
        return true;
    }
    return false;
}

async function FlushSubscriptions() {
  const client = getTableClient();
  const updatedEntity = {
    partitionKey: "",
    rowKey: "",
    SubscribedChannels: JSON.stringify(Subscriptions),
  };
  await client.updateEntity(updatedEntity, "Replace");
}

async function FlushSubscriptionsHourly(_bot: DiscordBot) {
  const frequency = /* 1 hour: */ 60 * 60 * 1000;
  setInterval(async () => {
    await FlushSubscriptions();
  }, frequency);
}

async function SendDailyAPOD(bot: DiscordBot) {
  const frequency = /* 1 day: */ 24 * 60 * 60 * 1000;
  setInterval(async () => {
    const client = getTableClient();
    const entity = await client.getEntity("", "");
    const channels: string = entity.SubscribedChannels as string;
    const subscriptions = JSON.parse(channels);
    const reply_contents = await MakeAPODRequest();
    for (const subscription of subscriptions) {
      const channel = await bot.channels.fetch(subscription);
      if (channel !== null && CanSendOnChannel(channel)) {
        await channel.send(reply_contents);
      }
    }
  }, frequency);
}

const SubscriptionTimers: ((bot: DiscordBot) => Promise<any>)[] = [
  FlushSubscriptionsHourly,
  SendDailyAPOD,
];

export async function SubscriptionManagerInitialize(bot: DiscordBot) {
  await LoadSubscriptions(bot);
  // 5am UTC is 12am Central.
  const secondsTo5AM =
    ((24 + 5) * 60 * 60 - ((new Date().getTime() / 1000) % (24 * 60 * 60))) %
    (24 * 60 * 60);
  for (const callback of SubscriptionTimers) {
    setTimeout(() => callback(bot), secondsTo5AM * 1000);
  }
}

export async function SubscriptionManagerCleanup() {
  await FlushSubscriptions();
}
