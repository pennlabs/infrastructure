import { Testing } from "cdk8s";
import { Construct } from "constructs";
import { PennLabsChart } from "../src";

/**
 * Helper function to run each chart test
 * @param build function containing the constructs to be generated
 */
export const chartTest = (
  build: (scope: Construct) => void,
  envOverrides?: {
    env: string;
    value: string;
  }[]
) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = "RELEASE_NAME";
  process.env.GIT_SHA = "TAG_FROM_CI";
  process.env.AWS_ACCOUNT_ID = "TEST_AWS_ACCOUNT_ID";

  envOverrides?.forEach(({ env: e, value: v }) => {
    process.env[e] = v;
  });

  const app = Testing.app();
  const chart = new PennLabsChart(app, "kittyhawk");
  build(chart);
  const results = Testing.synth(chart);
  expect(results).toMatchSnapshot();
};

/** Helper function to run each chart test
 *  @param build function containing the constructs to be generated
 */
export const failingTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = "RELEASE_NAME";
  process.env.GIT_SHA = "TAG_FROM_CI";
  process.env.AWS_ACCOUNT_ID = "TEST_AWS_ACCOUNT_ID";

  const app = Testing.app();
  expect(() => {
    const chart = new PennLabsChart(app, "kittyhawk");
    build(chart);
  }).toThrowError();
};

/**
 * Helper function to replace process.exit with a function that throws an error for testing
 */
const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error("process.exit: " + code);
});
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {
  /* do nothing */
});

export const failingTestNoGitSha = (_: (scope: Construct) => void) => {
  process.env.RELEASE_NAME = "RELEASE_NAME";
  process.env.GIT_SHA = "";
  process.env.AWS_ACCOUNT_ID = "TEST_AWS_ACCOUNT_ID";

  expect(() => {
    const app = Testing.app();
    new PennLabsChart(app, "kittyhawk");
  }).toThrowError("process.exit: 1");
  expect(mockConsoleError).toHaveBeenCalledTimes(1);
  expect(mockExit).toHaveBeenCalledWith(1);
  mockExit.mockClear();
};

export const failingTestNoAWSAccountId = (
  build: (scope: Construct) => void
) => {
  process.env.RELEASE_NAME = "RELEASE_NAME";
  process.env.GIT_SHA = "TAG_FROM_CI";
  process.env.AWS_ACCOUNT_ID = "";

  expect(() => {
    const app = Testing.app();
    const chart = new PennLabsChart(app, "kittyhawk");
    build(chart);
  }).toThrowError("process.exit: 1");
  expect(mockConsoleError).toHaveBeenCalledTimes(1);
  expect(mockExit).toHaveBeenCalledWith(1);
  mockConsoleError.mockClear();
};
