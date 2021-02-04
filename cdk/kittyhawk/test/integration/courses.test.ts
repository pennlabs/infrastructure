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
  

  new RedisApplication(scope, 'redis', { tag: '4.0' });

  new DjangoApplication(scope, 'celery', {
    image: backendImage,
    secret: secret,
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    djangoSettingsModule: 'PennCourses.settings.production',
    domains: [{ host: 'penncourseplan.com', isSubdomain: false },
    { host: 'penncoursealert.com', isSubdomain: false },
    { host: 'review.penncourses.org', isSubdomain: true }],
   });

  new DjangoApplication(scope, 'backend', {
    image: backendImage,
    secret: secret,
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    replicas: 3,
    djangoSettingsModule: 'PennCourses.settings.production',
    extraEnv: [{ name: 'PORT', value: '80' }],
    ingressPaths: ['/api', '/admin', '/accounts', '/assets', '/webhook'],
    domains: [{ host: 'penncourseplan.com', isSubdomain: false },
      { host: 'penncoursealert.com', isSubdomain: false },
      { host: 'review.penncourses.org', isSubdomain: true }],
  });

  new ReactApplication(scope, 'plan', {
    image: 'pennlabs/pcp-frontend',
    domain: 'penncourseplan.com',
    isSubdomain: false,
    ingressPaths: ['/'],
  });

  new ReactApplication(scope, 'alert', {
    image: 'pennlabs/pca-frontend',
    domain: 'penncoursealert.com',
    isSubdomain: false,
    ingressPaths: ['/'],
  });

  new ReactApplication(scope, 'review', {
    image: 'pennlabs/pcr-frontend',
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
