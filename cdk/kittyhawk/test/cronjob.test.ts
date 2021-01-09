import { Construct } from 'constructs';
import { CronJob } from '../src/cronjob';
import cronTime from 'cron-time-generator';
import { chartTest } from './utils';

export function buildCronjobVolumeChart(scope: Construct) {

  /** Tests a Cronjob with a volume. Written for 100% codecov. */
  new CronJob(scope, 'calculate-waits', {
    schedule: cronTime.every(5).minutes(),
    image: 'pennlabs/penn-courses-backend',
    secret: 'penn-courses',
    cmd: ['python', 'manage.py', 'calculatewaittimes'],
    secretMounts: [{ name: 'labs-api-server', subPath: 'ios-key', mountPath: '/app/ios_key.p8' }],
  })
}

test('Penn Basics', () => chartTest(buildCronjobVolumeChart));
