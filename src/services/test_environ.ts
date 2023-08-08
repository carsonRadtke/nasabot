import { describe, expect, test } from "@jest/globals";
import { getEnv } from "./environ";

process.env.WILL_FIND_IN_PATH = "1"; // TODO: jest probably accepts environment variables somehow

describe("test_environ", () => {
  test("test_getEnv", () => {
    expect(getEnv("WILL_FIND_IN_PATH")).toBe("1");
    expect(getEnv("WILL_NOT_FIND_IN_PATH", "1")).toBe("1");
    expect(() => getEnv("WILL_NOT_FIND_IN_PATH")).toThrow();
  });
});
