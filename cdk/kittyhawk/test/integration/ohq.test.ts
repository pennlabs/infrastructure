import { Construct } from 'constructs';
import { CronJob } from '../../src/cronjob';
import { Application, DjangoApplication, ReactApplication, RedisApplication } from '../../src/application'
import { chartTest } from '../utils'
import cronTime from 'cron-time-generator';

export function buildOHQChart(scope: Construct) {

  /** OHQ 
   * https://github.com/pennlabs/office-hours-queue/blob/master/k8s/values.yaml
   */
  const common = {
    image: 'pennlabs/office-hours-queue-backend',
    secret: 'office-hours-queue',
  }

  const djangoCommon = {
    ...common,
    djangoSettingsModule: 'officehoursqueue.settings.production',
    domain: 'ohq.io',
    extraEnv: [
      { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
  }

  new DjangoApplication(scope, 'django-asgi', {
    ...djangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  })

  new DjangoApplication(scope, 'django-wsgi', {
    ...djangoCommon,
    replicas: 4,
    ingressPaths: ['/api', '/admin', '/assets'],
  })

  new ReactApplication(scope, 'react', {
    image: common.image,
    domain: djangoCommon.domain,
    replicas: 2,
    ingressPaths: ['/'],
    portEnv: '80',
  })

  new RedisApplication(scope, 'redis', {})

  new Application(scope, 'celery', {
    ...common,
    cmd: ['celery', '-A', 'officehoursqueue', 'worker', '-lINFO'],
    extraEnv: [{ name: 'DJANGO_SETTINGS_MODULE', value: 'officehoursqueue.settings.production' },
      { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' }],
  })

  new CronJob(scope, 'calculate-waits', {
    schedule: cronTime.every(5).minutes(),
    ...common,
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
  });

}

test('OHQ', () => chartTest(buildOHQChart));
