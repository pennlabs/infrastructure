import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
import { NonEmptyArray } from '../../src/utils';
import { chartTest } from '../utils';

export function buildClubsChart(scope: Construct) {

  /** Penn Clubs and FYH
   * https://github.com/pennlabs/penn-clubs/blob/master/k8s/values.yaml
  */

  const backendImage = 'pennlabs/penn-clubs-backend';
  const clubsSecret = 'penn-clubs';
  const fyhSecret = 'first-year-hub';
  const clubsDomain = 'pennclubs.com';
  const fyhDomain = 'hub.provost.upenn.edu';

  const clubsDjangoCommon = {
    deployment: {
      image: backendImage,
      env: [
        { name: 'REDIS_HOST', value: 'penn-clubs-redis' },
      ],
      secret: clubsSecret,
    },
    domains: [{ host: clubsDomain }] as NonEmptyArray<{ host: string; isSubdomain?: boolean }>,
    djangoSettingsModule: 'pennclubs.settings.production',
  };

  const fyhDjangoCommon = {
    deployment: {
      image: backendImage,
      env: [
        { name: 'REDIS_HOST', value: 'penn-clubs-hub-redis' },
        { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' },
      ],
      secret: fyhSecret,
    },
    domains: [{ host: fyhDomain }] as NonEmptyArray<{ host: string; isSubdomain?: boolean }>,
    djangoSettingsModule: 'pennclubs.settings.production',

  };


  new RedisApplication(scope, 'redis', {});

  new DjangoApplication(scope, 'django-asgi', {
    ...clubsDjangoCommon,
    deployment: {
      image: clubsDjangoCommon.deployment.image,
      cmd: ['/usr/local/bin/asgi-run'],
      replicas: 2,
    },
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'django-wsgi', {
    ...clubsDjangoCommon,
    deployment: {
      image: clubsDjangoCommon.deployment.image,
      replicas: 5,
    },
    ingressPaths: ['/api'],
  });

  new ReactApplication(scope, 'react', {
    deployment: {
      image: 'pennlabs/penn-clubs-frontend',
      replicas: 2,
    },
    domain: clubsDomain,
    ingressPaths: ['/'],
    portEnv: '80',
  });

  /** FYH */

  new RedisApplication(scope, 'hub-redis', {});

  new DjangoApplication(scope, 'hub-django-asgi', {
    ...fyhDjangoCommon,
    deployment: {
      image: fyhDjangoCommon.deployment.image,
      cmd: ['/usr/local/bin/asgi-run'],
      replicas: 2,
    },
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'hub-django-wsgi', {
    ...fyhDjangoCommon,
    deployment: {
      image: backendImage,
      replicas: 3,
    },
    ingressPaths: ['/api'],
  });


  new ReactApplication(scope, 'hub-react', {
    deployment: {
      image: 'pennlabs/penn-clubs-frontend',
      replicas: 2,
      env: [
        { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' },
      ],
    },
    domain: fyhDomain,
    ingressPaths: ['/'],
    portEnv: '80',
  });

  /** Cronjobs **/

  new CronJob(scope, 'rank-clubs', {
    schedule: cronTime.everyDayAt(8),
    image: backendImage,
    secret: clubsSecret,
    cmd: ['python', 'manage.py', 'rank'],
  });

  new CronJob(scope, 'daily-notifications', {
    schedule: cronTime.everyDayAt(13),
    image: backendImage,
    secret: clubsSecret,
    cmd: ['python', 'manage.py', 'daily_notifications'],
  });

  new CronJob(scope, 'hub-daily-notifications', {
    schedule: cronTime.everyDayAt(13),
    image: backendImage,
    secret: fyhSecret,
    cmd: ['python', 'manage.py', 'daily_notifications'],
  });

  new CronJob(scope, 'calendar-import', {
    schedule: cronTime.everyDayAt(12),
    image: backendImage,
    secret: clubsSecret,
    cmd: ['python', 'manage.py', 'import_calendar_events'],
  });

  new CronJob(scope, 'hub-calendar-import', {
    schedule: cronTime.everyDayAt(12),
    image: backendImage,
    secret: fyhSecret,
    cmd: ['python', 'manage.py', 'import_calendar_events'],
  });

  new CronJob(scope, 'hub-paideia-calendar-import', {
    schedule: cronTime.everyDayAt(12),
    image: backendImage,
    secret: fyhSecret,
    cmd: ["python", "manage.py", "import_paideia_events"],
  });
}

test('Penn Clubs', () => chartTest(buildClubsChart));
