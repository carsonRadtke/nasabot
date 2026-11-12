import { env } from "process";

// TODO (@carsonradtke): Use a managed identity for azure resources.
export const BotEnv = {
  DiscordBotAPIToken: env["DISCORD_BOT_API_TOKEN"],
  NasaApiToken: env["NASA_API_TOKEN"],
  AzureAccount: env["AZURE_ACCOUNT"],
  AzureAccountKey: env["AZURE_ACCOUNT_KEY"],
  AzureTableName: env["AZURE_TABLE_NAME"],
};
