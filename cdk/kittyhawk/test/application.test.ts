import { Construct } from 'constructs';
import { Application, DjangoApplication, ReactApplication, RedisApplication, insertIfNotPresent } from '../src/application';
import { chartTest, failingTest } from './utils';

export function buildTagOverrideChart(scope: Construct) {
  /** Overrides the image tag set as env var **/
  new Application(scope, 'serve', {
    deployment: {
      image: 'pennlabs/website',
      tag: 'latest',
    },
  });
}

function buildRedisChart(scope: Construct) {
  new RedisApplication(scope, 'redis', {});
}
function buildFailingDjangoChart(scope: Construct) {
  new DjangoApplication(scope, 'platform', testConfig.django.failing);
}
function buildExampleDjangoChart(scope: Construct) {
  new DjangoApplication(scope, 'platform', testConfig.django.example);
}
function buildDefaultDjangoChart(scope: Construct) {
  new DjangoApplication(scope, 'platform', testConfig.django.default);
}
function buildExampleReactChart(scope: Construct) {
  new ReactApplication(scope, 'react', testConfig.react.example);
}
function buildFailingReactChart(scope: Construct) {
  new ReactApplication(scope, 'react', testConfig.react.failing);
}
function buildDefaultValuesReactChart(scope: Construct) {
  new ReactApplication(scope, 'react', testConfig.react.default);
}

test('Tag Override', () => chartTest(buildTagOverrideChart));

test('Redis Application', () => chartTest(buildRedisChart));
test('Django Application -- Failing', () => failingTest(buildFailingDjangoChart));
test('Django Application -- Example', () => chartTest(buildExampleDjangoChart));
test('Django Application -- Default', () => chartTest(buildDefaultDjangoChart));
test('React Application -- Failing', () => failingTest(buildFailingReactChart));
test('React Application -- Example', () => chartTest(buildExampleReactChart));
// TODO - add comparison to make sure the default values are correct
// e.g. (portEnv is assumed to be 80 & replicas is also defaulted)
test('React Application -- Default', () => chartTest(buildDefaultValuesReactChart));


test('insertIfNotPresent throws if already present', () => {
  let myEnvArray = [{ name: 'KEY1', value: 'VALUE1' }];
  expect(() => insertIfNotPresent(myEnvArray, 'KEY1', 'VALUE2'))
    .toThrow('KEY1 should not be redefined as an environment variable.');
});


const testConfig = {
  django: {
    example: {
      deployment: {
        image: 'pennlabs/platform',
        replicas: 2,
        env: [{ name: 'SOME_ENV', value: 'environment variables are cool' }],
      },
      domains: [{ host: 'platform.pennlabs.org', isSubdomain: true }],
      djangoSettingsModule: 'Platform.settings.production',
      ingressPaths: ['/'],
      portEnv: '80',
    },
    default: {
      deployment: {
        image: 'pennlabs/platform',
      },
      domains: [{ host: 'platform.pennlabs.org', isSubdomain: true }],
      djangoSettingsModule: 'Platform.settings.production',
      ingressPaths: ['/'],
    },
    failing: {
      deployment: {
        image: 'pennlabs/platform',
        /** Django Duplicated DOMAIN Env should fail **/
        env: [{ name: 'DOMAIN', value: 'platform.pennlabs.org' }],
      },
      domains: [{ host: 'platform.pennlabs.org', isSubdomain: true }],
      djangoSettingsModule: 'Platform.settings.production',
      ingressPaths: ['/'],
    },
  },
  react: {
    default: {
      deployment: {
        image: 'pennlabs/penn-clubs-frontend',
      },
      domain: 'pennclubs.com',
      ingressPaths: ['/'],
    },
    example: {
      deployment: {
        image: 'pennlabs/penn-clubs-frontend',
        replicas: 2,
        env: [{ name: 'SOME_ENV', value: 'environment variables are cool' }],
      },
      domain: 'pennclubs.com',
      ingressPaths: ['/'],
      portEnv: '80',
    },
    failing: {
      deployment: {
        image: 'pennlabs/penn-clubs-frontend',
        replicas: 2,
        /** React Duplicated DOMAIN Env should fail **/
        env: [{ name: 'DOMAIN', value: 'pennclubs.com' }],
      },
      domain: 'pennclubs.com',
      ingressPaths: ['/'],
      portEnv: '80',
    },
  }
}