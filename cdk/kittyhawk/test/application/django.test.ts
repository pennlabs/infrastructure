import { Construct } from "constructs";
import { HostRules } from "../../src";
import { DjangoApplication } from "../../src/application";
import { NonEmptyArray } from "../../src/utils";
import { chartTest } from "../utils";

/**
 * Test Configuration for DjangoApplication
 *
 * default - assumes mostly default values for the configuration
 * example - sample parameters
 * undefinedDomains - domains is undefined, no ingress required (example: celery on courses backend)
 * duplicateEnv - env is defined twice, should not throw an error
 * */
const djangoTestConfig = {
  default: {
    deployment: {
      image: "pennlabs/platform",
    },
    domains: [
      { host: "platform.pennlabs.org", paths: ["/"] },
    ] as NonEmptyArray<HostRules>,
    djangoSettingsModule: "Platform.settings.production",
    createServiceAccount: true,
  },
  example: {
    deployment: {
      image: "pennlabs/platform",
      replicas: 2,
      env: [{ name: "SOME_ENV", value: "environment variables are cool" }],
    },
    domains: [
      { host: "platform.pennlabs.org", isSubdomain: true, paths: ["/"] },
    ] as NonEmptyArray<HostRules>,
    djangoSettingsModule: "Platform.settings.production",
    port: 8080,
  },
  duplicateEnv: {
    deployment: {
      image: "pennlabs/platform",
      env: [{ name: "DOMAIN", value: "platform.pennlabs.org" }],
    },
    domains: [
      { host: "platform.pennlabs.org", isSubdomain: true, paths: ["/"] },
    ] as NonEmptyArray<HostRules>,
    djangoSettingsModule: "Platform.settings.production",
  },
  undefinedDomains: {
    deployment: {
      image: "pennlabs/platform",
      env: [{ name: "DOMAIN", value: "platform.pennlabs.org" }],
    },
    domains: undefined,
    djangoSettingsModule: "Platform.settings.production",
  },
};

test("Django Application -- Default", () => chartTest(buildDjangoChartDefault));
test("Django Application -- Example", () => chartTest(buildDjangoChartExample));
test("Django Application -- Duplicate Env", () =>
  chartTest(buildDjangoChartDuplicateEnv));
test("Django Application -- Undefined Domains Chart", () =>
  chartTest(buildDjangoIngressUndefinedDomainsChart));

function buildDjangoChartDefault(scope: Construct) {
  new DjangoApplication(scope, "platform", djangoTestConfig.default);
}
function buildDjangoChartExample(scope: Construct) {
  new DjangoApplication(scope, "platform", djangoTestConfig.example);
}
function buildDjangoIngressUndefinedDomainsChart(scope: Construct) {
  new DjangoApplication(scope, "platform", djangoTestConfig.undefinedDomains);
}
function buildDjangoChartDuplicateEnv(scope: Construct) {
  new DjangoApplication(scope, "platform", djangoTestConfig.duplicateEnv);
}
