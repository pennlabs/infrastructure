import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { CronJob } from '../../src';
import { Application, ReactApplication, RedisApplication } from '../../src/application'
import { chartTest } from '../utils'

export function buildCoursesChart(scope: Construct) {

  /** Penn Courses 
   * https://github.com/pennlabs/penn-courses/blob/master/k8s/values.yaml
  */

  const common = {
    image: 'pennlabs/penn-courses-backend',
    secret: 'penn-courses',
  }

  new RedisApplication(scope, 'redis', { tag: '4.0' })

  new Application(scope, 'celery', {
    ...common,
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    extraEnv: [{ name: 'DJANGO_SETTINGS_MODULE', value: 'PennCourses.settings.production' }],
  })

  new Application(scope, 'backend', {
    ...common,
    cmd: ['celery', 'worker', '-A', 'PennCourses', '-Q', 'alerts,celery', '-linfo'],
    replicas: 3,
    extraEnv: [{ name: 'PORT', value: '80' },
      { name: 'DJANGO_SETTINGS_MODULE', value: 'PennCourses.settings.production' }],
    ingress: [
      { host: 'penncourseplan.com', paths: ['/api', '/admin', '/accounts', '/assets'] },
      { host: 'penncoursealert.com', paths: ['/api', '/admin', '/accounts', '/assets', '/webhook'] },
      { host: 'review.penncourses.org', paths: ['/api', '/admin', '/accounts', '/assets'] },
    ],
  })

  new ReactApplication(scope, 'plan', {
    image: 'pennlabs/pcp-frontend',
    domain: 'penncourseplan.com',
    ingressPaths: ['/'],
  })

  new ReactApplication(scope, 'alert', {
    image: 'pennlabs/pcp-frontend',
    domain: 'penncoursealert.com',
    ingressPaths: ['/'],
  })

  new ReactApplication(scope, 'review', {
    image: 'pennlabs/pcp-frontend',
    domain: 'review.penncourses.org',
    ingressPaths: ['/'],
  })

  new CronJob(scope, 'load-courses', {
    schedule: cronTime.everyDayAt(3),
    ...common,
    cmd: ['python', 'manage.py', 'registrarimport'],
  })

  new CronJob(scope, 'report-stats', {
    schedule: cronTime.everyDayAt(20),
    ...common,
    cmd: ['python', 'manage.py', 'alertstats', '1', '--slack'],
  })
}

test('Penn Courses', () => chartTest(buildCoursesChart));
