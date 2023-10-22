import { Construct } from "constructs";
import { RedisApplication } from "../../src/application";
import { chartTest, failingTestNoAWSAccountId } from "../utils";

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
  persistent: {
    persistData: true,
  },
  persistentWithCustomVolumes: {
    persistData: true,
    deployment: {
      secretMounts: [
        {
          name: "example-mount-secret",
          mountPath: "/etc/redis",
        },
      ],
      volumeMounts: [
        {
          name: "example-mount",
          mountPath: "/etc/volumes",
        },
      ],
    },
  },
  customConfigMap: {
    configMap: {
      name: "custom-config-map",
      data: {
        "redis-config": "custom-config",
      },
    },
  },
};

function buildRedisChartDefault(scope: Construct) {
  new RedisApplication(scope, "redis", redisTestConfig.default);
}
function buildRedisChartExample(scope: Construct) {
  new RedisApplication(scope, "redis", redisTestConfig.example);
}

function buildRedisChartCustomConfigMap(scope: Construct) {
  new RedisApplication(scope, "redis", redisTestConfig.customConfigMap);
}

function buildRedisChartPersistent(scope: Construct) {
  new RedisApplication(scope, "redis", redisTestConfig.persistent);
}
function buildRedisChartPersistentWithCustomVolumes(scope: Construct) {
  new RedisApplication(
    scope,
    "redis",
    redisTestConfig.persistentWithCustomVolumes
  );
}

test("Redis -- No ServiceAccount But CreateServiceAccount", () =>
  failingTestNoAWSAccountId(buildRedisChartExample));
test("Redis Application -- Default", () => chartTest(buildRedisChartDefault));
test("Redis Application -- Example", () => chartTest(buildRedisChartExample));
test("Redis Application -- Persistence", () =>
  chartTest(buildRedisChartPersistent));
test("Redis Application -- Custom ConfigMap", () =>
  chartTest(buildRedisChartCustomConfigMap));

test("Redis Application -- Persistence with Custom Volumes", () =>
  chartTest(buildRedisChartPersistentWithCustomVolumes));
