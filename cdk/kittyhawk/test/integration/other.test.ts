import { Construct } from 'constructs';
import { CronJob } from '../../src/cronjob';
import { Application, DjangoApplication, ReactApplication, RedisApplication } from '../../src/application'
import { chartTest } from '../utils'
import cronTime from 'cron-time-generator';

export function buildWebsiteChart(scope: Construct) {

  /** Penn Labs Website
   * https://github.com/pennlabs/website/blob/master/k8s/values.yaml
   */
  new ReactApplication(scope, 'serve', {
    image: 'pennlabs/website',
    domain: 'pennlabs.org',
    ingressPaths: ['/'],
  })
}

export function buildBasicsChart(scope: Construct) {

  /** Penn Basics 
   * https://github.com/pennlabs/penn-basics/blob/master/k8s/values.yaml
  */
  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-basics',
    secret: 'penn-basics',
    portEnv: '80',
    domain: 'pennbasics.com',
    ingressPaths: ['/'],
  })
}


export function buildPlatformChart(scope: Construct) {

  /** Platform
   * https://github.com/pennlabs/platform/blob/master/k8s/values.yaml
   */

  const common = {
    image: 'pennlabs/platform',
    secret: 'platform',
  }

  new DjangoApplication(scope, 'platform', {
    ...common,
    port: 443,
    domain: 'platform.pennlabs.org',
    djangoSettingsModule: 'Platform.settings.production',
    ingressPaths: ['/'],
    secretMounts: [{ name: 'platform', subPath: 'SHIBBOLETH_CERT', mountPath: '/etc/shibboleth/sp-cert.pem' },
      { name: 'platform', subPath: 'SHIBBOLETH_KEY', mountPath: '/etc/shibboleth/sp-key.pem' }],
  })

  new CronJob(scope, 'clear-expired-tokens', {
    ...common,
    schedule: cronTime.everySundayAt(5),
    cmd: ['python3', 'manage.py', 'cleartokens'],
  })
}


export function buildCFAChart(scope: Construct) {

  /** Common Funding Application
   * https://github.com/pennlabs/common-funding-application/blob/master/k8s/values.yaml
   */
  new DjangoApplication(scope, 'django', {
    image: 'pennlabs/common-funding-application',
    secret: 'common-funding-application',
    domain: 'penncfa.com',
    ingressPaths: ['/'],
    djangoSettingsModule: 'penncfa.settings.production',
  })
}


export function buildLabsAPIServerChart(scope: Construct) {
  /**
   * Labs API Server
   * https://github.com/pennlabs/labs-api-server/blob/master/k8s/values.yaml
   */
  const common = {
    image: 'pennlabs/labs-api-server',
    secret: 'labs-api-server',
  }
  new Application(scope, 'flask', {
    ...common,
    ingress: [{ host: 'api.pennlabs.org', paths: ['/'] }],
    secretMounts: [{ name: 'labs-api-server', subPath: 'ios-key', mountPath: '/app/ios_key.p8' }],
  })

  new RedisApplication(scope, 'redis', { tag: '5' })

  new CronJob(scope, 'laundry', {
    ...common,
    schedule: cronTime.every(15).minutes(),
    cmd: ['python3', 'cron/save_laundry_data.py'],
  })

  new CronJob(scope, 'gsr-notifications', {
    ...common,
    schedule: '20,50 * * * *', // Not sure how to write this with cronTime
    cmd: ['python3', 'cron/send_gsr_push_notifications.py'],
    secretMounts: [{ name: 'labs-api-server', subPath: 'ios-key', mountPath: '/app/ios_key.p8' }],
  })
}

test('Penn Labs Website', () => chartTest(buildWebsiteChart));
test('Penn Basics', () => chartTest(buildBasicsChart));
test('Platform API', () => chartTest(buildPlatformChart));
test('CFA', () => chartTest(buildCFAChart))

