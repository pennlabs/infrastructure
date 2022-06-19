import { Construct } from "constructs";
import { HostRules } from "../src";
import {
  Application,
  DjangoApplication,
  ReactApplication,
  RedisApplication,
} from "../src/application";
import { NonEmptyArray } from "../src/utils";
import {
  chartTest,
  failingTestNoAWSAccountId,
  failingTestNoGitSha,
} from "./utils";

export function buildTagOverrideChart(scope: Construct) {
  /** Overrides the image tag set as env var **/
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
  });
}
export function buildSimpleChart(scope: Construct) {
  /** Overrides the image tag set as env var **/
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
    },
  });
}

test("Application -- No Git Sha", () => failingTestNoGitSha(buildSimpleChart));
test("Application -- No ServiceAccount But CreateServiceAccount", () =>
  failingTestNoAWSAccountId(buildRedisChartExample));

function buildRedisChartDefault(scope: Construct) {
  new RedisApplication(scope, "redis", testConfig.redis.default);
}
function buildRedisChartExample(scope: Construct) {
  new RedisApplication(scope, "redis", testConfig.redis.example);
}

function buildDjangoChartDefault(scope: Construct) {
  new DjangoApplication(scope, "platform", testConfig.django.default);
}
function buildDjangoChartExample(scope: Construct) {
  new DjangoApplication(scope, "platform", testConfig.django.example);
}
function buildDjangoIngressUndefinedDomainsChart(scope: Construct) {
  new DjangoApplication(scope, "platform", testConfig.django.undefinedDomains);
}
function buildDjangoChartDuplicateEnv(scope: Construct) {
  new DjangoApplication(scope, "platform", testConfig.django.duplicateEnv);
}
function buildReactChartDefault(scope: Construct) {
  new ReactApplication(scope, "react", testConfig.react.default);
}
function buildReactChartExample(scope: Construct) {
  new ReactApplication(scope, "react", testConfig.react.example);
}
function buildReactChartDuplicateEnv(scope: Construct) {
  new ReactApplication(scope, "react", testConfig.react.duplicateEnv);
}

test("Tag Override", () => chartTest(buildTagOverrideChart));

// Redis tests
test("Redis Application -- Default", () => chartTest(buildRedisChartDefault));
test("Redis Application -- Example", () => chartTest(buildRedisChartExample));

// Django tests
test("Django Application -- Default", () => chartTest(buildDjangoChartDefault));
test("Django Application -- Example", () => chartTest(buildDjangoChartExample));
test("Django Application -- Duplicate Env", () =>
  chartTest(buildDjangoChartDuplicateEnv));
test("Django Application -- Feature Branch Deploy", () => {
  process.env.DEPLOY_TO_FEATURE_BRANCH = "true";
  chartTest(buildDjangoChartDefault);
});
test("Django Application -- Undefined Domains Chart", () =>
  chartTest(buildDjangoIngressUndefinedDomainsChart));

// React tests
test("React Application -- Default", () => chartTest(buildReactChartDefault));
test("React Application -- Example", () => chartTest(buildReactChartExample));
test("React Application -- Feature Branch Deploy", () => {
  process.env.DEPLOY_TO_FEATURE_BRANCH = "true";
  chartTest(buildReactChartDefault);
});
test("React Application -- Duplicate Env", () =>
  chartTest(buildReactChartDuplicateEnv));

afterEach(() => {
  delete process.env.DEPLOY_TO_FEATURE_BRANCH;
});

/**
 * Test Configuration for RedisApplication
 *
 * default - assumes the default values for the configuration
 * example - uses the customized values for the configuration
 */
const redisTestConfig = {
  default: {},
  example: {
    deployment: {
      image: "custom-redis-image",
      tag: "5.0",
    },
    port: 6380,
    createServiceAccount: true,
  },
};

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

const testConfig = {
  redis: redisTestConfig,
  django: djangoTestConfig,
  react: reactTestConfig,
};
