import { Construct } from 'constructs';
import { Application, DjangoApplication, ReactApplication, insertIfNotPresent } from '../src/application';
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


export function buildFailingDjangoChart(scope: Construct) {

  /** Django Duplicated DOMAIN Env should fail **/
  new DjangoApplication(scope, 'platform', {
    deployment: {
      image: 'pennlabs/platform',
      env: [{ name: 'DOMAIN', value: 'platform.pennlabs.org' }],
    },
    domains: [{ host: 'platform.pennlabs.org', isSubdomain: true }],
    djangoSettingsModule: 'Platform.settings.production',
    ingressPaths: ['/'],
  });
}

export function buildFailingReactChart(scope: Construct) {

  /** React Duplicated DOMAIN Env should fail **/
  new ReactApplication(scope, 'react', {
    deployment: {
      image: 'pennlabs/penn-clubs-frontend',
      replicas: 2,
      env: [{ name: 'DOMAIN', value: 'pennclubs.com' }],
    },
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    portEnv: '80',
  });
}

test('Tag Override', () => chartTest(buildTagOverrideChart));

test('Django Application -- Failing', () => failingTest(buildFailingDjangoChart));

test('React Application -- Failing', () => failingTest(buildFailingReactChart));

test('insertIfNotPresent throws if already present', () => {
  let myEnvArray = [{ name: 'KEY1', value: 'VALUE1' }];
  expect(() => insertIfNotPresent(myEnvArray, 'KEY1', 'VALUE2'))
    .toThrow('KEY1 should not be redefined as an enviroment variable.');
});