import { test, expect } from "@jest/globals";
import { CommandKind, HandleCommand } from "../src/lib/commandHandler";

test("test_command_handler", () => {
  for (const command of [
    CommandKind.APOD,
    CommandKind.Help,
    CommandKind.Unknown,
    CommandKind.Subscribe,
    CommandKind.Unsubscribe,
  ]) {
    const apodRes = HandleCommand(`./nasabot ${command}`);
    expect(apodRes).toBeDefined();
    expect(apodRes.command).toBe("./nasabot");
    expect(apodRes.subcommand).toBe(command);
    expect(apodRes.args).toEqual([]);
  }
});
