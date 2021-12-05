import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { CronJob } from '../../src';
import { DjangoApplication, ReactApplication, RedisApplication } from '../../src/application';
import { chartTest } from '../utils';

export function buildCoursesChart(scope: Construct) {

  /** Penn Courses
   * https://github.com/pennlabs/penn-courses/blob/master/k8s/values.yaml
  */

  const backendImage = 'pennlabs/penn-courses-backend';
  const secret = 'penn-courses';


  new RedisApplication(scope, 'redis', { deployment: { tag: '4.0' } });

  new DjangoApplication(scope, 'celery', {
    deployment: {
      image: backendImage,
      secret: secret,
      cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    },
    djangoSettingsModule: 'PennCourses.settings.production',
    domains: [{ host: 'penncourseplan.com' },
      { host: 'penncoursealert.com' },
      { host: 'review.penncourses.org' }],
  });

  new DjangoApplication(scope, 'backend', {
    deployment: {
      image: backendImage,
      secret: secret,
      cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
      replicas: 3,
      env: [{ name: 'PORT', value: '80' }],
    },
    djangoSettingsModule: 'PennCourses.settings.production',
    ingressPaths: ['/api', '/admin', '/accounts', '/assets', '/webhook'],
    domains: [{ host: 'penncourseplan.com' },
      { host: 'penncoursealert.com' },
      { host: 'review.penncourses.org', isSubdomain: true }],
  });

  new ReactApplication(scope, 'plan', {
    deployment: {
      image: 'pennlabs/pcp-frontend',
    },
    domain: 'penncourseplan.com',
    ingressPaths: ['/'],
  });

  new ReactApplication(scope, 'alert', {
    deployment: {
      image: 'pennlabs/pca-frontend',
    },
    domain: 'penncoursealert.com',
    ingressPaths: ['/'],
  });

  new ReactApplication(scope, 'review', {
    deployment: {
      image: 'pennlabs/pcr-frontend',
    },
    domain: 'review.penncourses.org',
    isSubdomain: true,
    ingressPaths: ['/'],
  });

  new CronJob(scope, 'load-courses', {
    schedule: cronTime.everyDayAt(3),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'registrarimport'],
  });

  new CronJob(scope, 'report-stats', {
    schedule: cronTime.everyDayAt(20),
    image: backendImage,
    secret: secret,
    cmd: ['python', 'manage.py', 'alertstats', '1', '--slack'],
  });
}

test('Penn Courses', () => chartTest(buildCoursesChart));
