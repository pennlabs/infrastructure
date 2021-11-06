import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
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
    image: backendImage,
    secret: clubsSecret,
    domains: [{ host: clubsDomain }],
    djangoSettingsModule: 'pennclubs.settings.production',
    extraEnv: [
      { name: 'REDIS_HOST', value: 'penn-clubs-redis' },
    ],
  };

  const fyhDjangoCommon = {
    image: backendImage,
    secret: fyhSecret,
    domains: [{ host: fyhDomain }],
    djangoSettingsModule: 'pennclubs.settings.production',
    extraEnv: [
      { name: 'REDIS_HOST', value: 'penn-clubs-hub-redis' },
      { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' },
    ],
  };


  new RedisApplication(scope, 'redis', {});

  new DjangoApplication(scope, 'django-asgi', {
    ...clubsDjangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'django-wsgi', {
    ...clubsDjangoCommon,
    replicas: 3,
    ingressPaths: ['/api'],
  });

  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: clubsDomain,
    ingressPaths: ['/'],
    portEnv: '80',
  });

  /** FYH */

  new RedisApplication(scope, 'hub-redis', {});

  new DjangoApplication(scope, 'hub-django-asgi', {
    ...fyhDjangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  });

  new DjangoApplication(scope, 'hub-django-wsgi', {
    ...fyhDjangoCommon,
    replicas: 3,
    ingressPaths: ['/api'],
  });


  new ReactApplication(scope, 'hub-react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: fyhDomain,
    ingressPaths: ['/'],
    portEnv: '80',
    extraEnv: [
      { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' },
    ],
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
}

test('Penn Clubs', () => chartTest(buildClubsChart));
