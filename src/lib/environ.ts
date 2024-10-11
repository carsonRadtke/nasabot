import { env } from "process";

function GetOptionalEnvVar(
  name: string,
  fallback?: string,
): string | undefined {
  return env[name] ?? fallback;
}

function GetRequiredEnvVar(name: string): string {
  const value = GetOptionalEnvVar(name, undefined);
  if (value === undefined) {
    console.error(`Error: ${name} was not provided. Exiting.`);
    process.exit(1);
  }
  return value;
}

// TODO (@carsonradtke): Use a managed identity for azure resources.
export const BotEnv = {
  DiscordBotAPIToken: GetRequiredEnvVar("DISCORD_BOT_API_TOKEN"),
  NASAAPIToken: GetRequiredEnvVar("NASA_API_TOKEN"),
  AzureAccount: GetRequiredEnvVar("AZURE_ACCOUNT"),
  AzureAccountKey: GetRequiredEnvVar("AZURE_ACCOUNT_KEY"),
  AzureTableName: GetRequiredEnvVar("AZURE_TABLE_NAME"),
  CallMain: GetOptionalEnvVar("CALL_MAIN", "1"),
  SkipHello: GetOptionalEnvVar("SKIP_HELLO", "0"),
};
