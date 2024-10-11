import * as Discord from "discord.js";

export function CanSendOnChannel(channel: Discord.Channel) {
  return (
    channel instanceof Discord.TextChannel ||
    channel instanceof Discord.DMChannel
  );
}
