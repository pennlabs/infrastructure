import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { CronJob } from '../../src';
import { DjangoApplication, RedisApplication, ReactApplication } from '../../src/application';
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
      ingressProps: {
        annotations: { ['ingress.kubernetes.io/content-security-policy']: "frame-ancestors 'none';" },
      },
      domains: [{ host: 'penncourseplan.com', paths: ["/api", "/admin", "/accounts", "/assets"] },
        { host: 'penncoursealert.com', paths: ["/api", "/admin", "/accounts", "/assets", "/webhook"] },
        { host: 'penncoursereview.com', paths: ["/api", "/admin", "/accounts", "/assets"]}],
    });

    new ReactApplication(scope, 'landing', {
      deployment: {
        image: 'pennlabs/pcx-landing',
      },
      domain: { host: 'penncourses.org', paths: ['/'] },
    });

    new ReactApplication(scope, 'plan', {
      deployment: {
        image: 'pennlabs/pcp-frontend',
      },
      domain: { host: 'penncourseplan.org', paths: ['/'] },
    });

    new ReactApplication(scope, 'alert', {
      deployment: {
        image: 'pennlabs/pca-frontend',
      },
      domain: { host: 'penncoursealert.org', paths: ['/'] },
    });

    new ReactApplication(scope, 'review', {
      deployment: {
        image: 'pennlabs/pcr-frontend',
      },
      domain: { host: 'penncoursereview.org', paths: ['/'] },
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
