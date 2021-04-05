import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
import { chartTest } from '../utils';

export function buildOHQChart(scope: Construct) {

  /** OHQ
   * https://github.com/pennlabs/office-hours-queue/blob/master/k8s/values.yaml
   */

  const backendImage = 'pennlabs/office-hours-queue-backend';
  const secret = 'office-hours-queue';
  const domain = 'ohq.io';

  const djangoCommon = {
    image: backendImage,
    secret: secret,
    djangoSettingsModule: 'officehoursqueue.settings.production',
    domains: [{ host: domain, isSubdomain: false }],
    extraEnv: [
      { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' },
    ],
  };

  new DjangoApplication(scope, 'django-asgi', {
    ...djangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'django-wsgi', {
    ...djangoCommon,
    replicas: 4,
    ingressPaths: ['/api', '/admin', '/assets'],
  });

  new ReactApplication(scope, 'react', {
    image: 'pennlabs/office-hours-queue-frontend',
    domain: domain,
    isSubdomain: false,
    replicas: 2,
    ingressPaths: ['/'],
    portEnv: '80',
  });

  new RedisApplication(scope, 'redis', {});

  new DjangoApplication(scope, 'celery', {
    ...djangoCommon,
    cmd: ['celery', '-A', 'officehoursqueue', 'worker', '-lINFO'],
  });

  new CronJob(scope, 'calculate-waits', {
    schedule: cronTime.every(5).minutes(),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
  });

}

test('OHQ', () => chartTest(buildOHQChart));
