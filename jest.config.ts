import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  silent: false,
  testMatch: ["**/src/**/test_*.ts"],
};

export default config;
