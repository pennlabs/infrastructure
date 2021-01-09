import { Construct } from 'constructs';
import { Application, DjangoApplication, ReactApplication } from '../src/application'
import { chartTest, failingTest} from './utils'


export function buildTagOverrideChart(scope: Construct) {

  /** Overrides the image tag set as env var **/
  new Application(scope, 'serve', {
    image: 'pennlabs/website',
    tag: 'latest',
  })
}


export function buildFailingDjangoChart(scope: Construct) {

  /** Django Duplicated DOMAIN Env should fail **/
  new DjangoApplication(scope, 'platform', {
    image: 'pennlabs/platform',
    domain: 'platform.pennlabs.org',
    djangoSettingsModule: 'Platform.settings.production',
    extraEnv: [ { name: 'DOMAIN', value: 'platform.pennlabs.org' }],
    ingressPaths: ['/'],
  })
}
  
export function buildFailingReactChart(scope: Construct) {
  
  /** React Duplicated DOMAIN Env should fail **/
  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    extraEnv: [ { name: 'DOMAIN', value: 'pennclubs.com' }],
    portEnv: '80',
  })
}

test('Tag Override', () => chartTest(buildTagOverrideChart));
  
test('Django Application -- Failing', () => failingTest(buildFailingDjangoChart));
  
test('React Application -- Failing', () => failingTest(buildFailingReactChart));