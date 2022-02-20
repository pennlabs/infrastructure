import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
import { NonEmptyArray } from '../../src/utils';
import { chartTest } from '../utils';

export function buildOHQChart(scope: Construct) {

  /** OHQ
   * https://github.com/pennlabs/office-hours-queue/blob/master/k8s/values.yaml
   */

  const backendImage = 'pennlabs/office-hours-queue-backend';
  const secret = 'office-hours-queue';
  const domain = 'ohq.io';

  const djangoCommon = {
    deployment: {
      image: backendImage,
      env: [
        { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' },
      ],
      secret: secret,
    },
    djangoSettingsModule: 'officehoursqueue.settings.production',
    domains: [{ host: domain }] as NonEmptyArray<{ host: string; isSubdomain?: boolean }>,
  };

  new DjangoApplication(scope, 'django-asgi', {
    ...djangoCommon,
    deployment: {
      image: djangoCommon.deployment.image,
      cmd: ['/usr/local/bin/asgi-run'],
      replicas: 4,
    },
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'django-wsgi', {
    ...djangoCommon,
    deployment: {
      image: djangoCommon.deployment.image,
      replicas: 8,
    },
    ingressPaths: ['/api', '/admin', '/assets'],
  });

  new ReactApplication(scope, 'react', {
    deployment: {
      image: 'pennlabs/office-hours-queue-frontend',
      replicas: 2,
    },
    domain: domain,
    ingressPaths: ['/'],
    portEnv: '80',
  });

  new RedisApplication(scope, 'redis', {});

  new DjangoApplication(scope, 'celery', {
    ...djangoCommon,
    deployment: {
      image: djangoCommon.deployment.image,
      cmd: ['celery', '-A', 'officehoursqueue', 'worker', '-lINFO'],
    },
  });

  new CronJob(scope, 'calculate-waits', {
    schedule: cronTime.every(5).minutes(),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
  });
  
  new CronJob(scope, 'queue-daily-stat', {
    schedule: cronTime.everyDayAt(8),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'queue_daily_stat'],
  });

  new CronJob(scope, 'queue-heatmap-stat', {
    schedule: cronTime.everyDayAt(8),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'queue_heatmap_stat'],
  });
}

test('OHQ', () => chartTest(buildOHQChart));
