import { Construct } from 'constructs';
import { Application, DjangoApplication, ReactApplication, RedisApplication } from '../src/application';
import { chartTest } from './utils';

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
test('Django Application -- Example', () => chartTest(buildExampleDjangoChart));
test('Django Application -- Example Duplicate Env', () => chartTest(buildFailingDjangoChart));
test('Django Application -- Default', () => chartTest(buildDefaultDjangoChart));
test('React Application -- Example', () => chartTest(buildExampleReactChart));
test('React Application -- Example Duplicate Env', () => chartTest(buildFailingReactChart));
// TODO - add comparison to make sure the default values are correct
// e.g. (portEnv is assumed to be 80 & replicas is also defaulted)
test('React Application -- Default', () => chartTest(buildDefaultValuesReactChart));

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
        /** Django Duplicated DOMAIN Env should NO longer fail :D **/
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
        /** React Duplicated DOMAIN Env should NO longer fail :D **/
        env: [{ name: 'DOMAIN', value: 'pennclubs.com' }],
      },
      domain: 'pennclubs.com',
      ingressPaths: ['/'],
      portEnv: '80',
    },
  },
};