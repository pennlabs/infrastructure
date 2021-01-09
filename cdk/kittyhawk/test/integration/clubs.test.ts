import { Construct } from 'constructs';
import { CronJob } from '../../src/cronjob';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application'
import { chartTest } from '../utils'
import cronTime from 'cron-time-generator';

export function buildClubsChart(scope: Construct) {

  /** Penn Clubs 
   * https://github.com/pennlabs/penn-clubs/blob/master/k8s/values.yaml
  */
  new RedisApplication(scope, 'redis', {})

  const clubsCommon = {
    image: 'pennlabs/penn-clubs-backend',
    secret: 'penn-clubs',
  }
  const clubsDjangoCommon = {
    ...clubsCommon,
    domain: 'pennclubs.com',
    djangoSettingsModule: 'pennclubs.settings.production',
    extraEnv: [
      { name: 'REDIS_HOST', value: 'penn-clubs-redis' }],
  }

  new DjangoApplication(scope, 'django-asgi', {
    ...clubsDjangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  })

  new DjangoApplication(scope, 'django-wsgi', {
    ...clubsDjangoCommon,
    replicas: 3,
    ingressPaths: ['/api'],
  })

  new ReactApplication(scope, 'react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    portEnv: '80',
  })

  /** FYH */

  new RedisApplication(scope, 'hub-redis', {})

  const fyhCommon = {
    image: 'pennlabs/penn-clubs-backend',
    secret: 'first-year-hub',
  }

  const fyhDjangoCommon = {
    ...fyhCommon,
    domain: 'hub.provost.upenn.edu',
    djangoSettingsModule: 'pennclubs.settings.production',
    extraEnv: [
      { name: 'REDIS_HOST', value: 'penn-clubs-hub-redis' },
      { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' }],
  }

  new DjangoApplication(scope, 'hub-django-asgi', {
    ...fyhDjangoCommon,
    cmd: ['/usr/local/bin/asgi-run'],
    replicas: 2,
    ingressPaths: ['/api/ws'],
  })

  new DjangoApplication(scope, 'hub-django-wsgi', {
    ...fyhDjangoCommon,
    replicas: 3,
    ingressPaths: ['/api'],
  })


  new ReactApplication(scope, 'hub-react', {
    image: 'pennlabs/penn-clubs-frontend',
    replicas: 2,
    domain: 'pennclubs.com',
    ingressPaths: ['/'],
    portEnv: '80',
    extraEnv: [
      { name: 'NEXT_PUBLIC_SITE_NAME', value: 'fyh' }],
  })

  /** Cronjobs **/

  new CronJob(scope, 'rank-clubs', {
    schedule: cronTime.everyDayAt(8),
    ...clubsCommon,
    cmd: ['python', 'manage.py', 'rank'],
  });

  new CronJob(scope, 'daily-notifications', {
    schedule: cronTime.everyDayAt(13),
    ...clubsCommon,
    cmd: ['python', 'manage.py', 'daily_notifications'],
  });

  new CronJob(scope, 'hub-daily-notifications', {
    schedule: cronTime.everyDayAt(13),
    ...fyhCommon,
    cmd: ['python', 'manage.py', 'daily_notifications'],
  });

  new CronJob(scope, 'calendar-import', {
    schedule: cronTime.everyDayAt(12),
    ...clubsCommon,
    cmd: ['python', 'manage.py', 'import_calendar_events'],
  });

  new CronJob(scope, 'hub-calendar-import', {
    schedule: cronTime.everyDayAt(12),
    ...fyhCommon,
    cmd: ['python', 'manage.py', 'import_calendar_events'],
  });
}

test('Penn Clubs', () => chartTest(buildClubsChart));
