import { Construct } from "constructs";
import { ReactApplication } from "../../src/application";
import { chartTest } from "../utils";

/**
 * Test Configuration for ReactApplication
 *
 * default - assumes mostly default values for the configuration
 * example - sample parameters
 * duplicateEnv - env is defined twice, should not throw an error
 */
const reactTestConfig = {
  default: {
    deployment: {
      image: "pennlabs/penn-clubs-frontend",
    },
    domain: { host: "pennclubs.com", paths: ["/"] },
    ingressPaths: ["/"],
  },
  example: {
    deployment: {
      image: "pennlabs/penn-clubs-frontend",
      replicas: 2,
      env: [{ name: "SOME_ENV", value: "environment variables are cool" }],
    },
    domain: { host: "pennclubs.com", paths: ["/"] },
    port: 8080,
  },
  duplicateEnv: {
    deployment: {
      image: "pennlabs/penn-clubs-frontend",
      replicas: 2,
      env: [{ name: "DOMAIN", value: "pennclubs.com" }],
    },
    domain: { host: "pennclubs.com", paths: ["/"] },
    port: 80,
  },
};

test("React Application -- Default", () => chartTest(buildReactChartDefault));
test("React Application -- Example", () => chartTest(buildReactChartExample));
test("React Application -- Duplicate Env", () =>
  chartTest(buildReactChartDuplicateEnv));

function buildReactChartDefault(scope: Construct) {
  new ReactApplication(scope, "react", reactTestConfig.default);
}
function buildReactChartExample(scope: Construct) {
  new ReactApplication(scope, "react", reactTestConfig.example);
}
function buildReactChartDuplicateEnv(scope: Construct) {
  new ReactApplication(scope, "react", reactTestConfig.duplicateEnv);
}
