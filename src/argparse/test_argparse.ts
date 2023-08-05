import * as ArgParse from ".";
import { describe, expect, test } from "@jest/globals"

describe('test_Argparse', () => {
  test('Argparse.parse', () => {
    expect(ArgParse.parse("")).toStrictEqual([]);
    expect(ArgParse.parse("command")).toStrictEqual(["command"]);
    expect(ArgParse.parse("command subcommand")).toStrictEqual(["command", "subcommand"]);
    expect(ArgParse.parse("command 'sub command'")).toStrictEqual(["command", "sub command"]);
    expect(ArgParse.parse("command 'sub \\'command\\''")).toStrictEqual(["command", "sub 'command'"])
    expect(() => ArgParse.parse("command 'subcommand")).toThrow(Error);
  })
});