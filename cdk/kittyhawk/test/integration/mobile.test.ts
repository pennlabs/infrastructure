import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
import { chartTest } from '../utils';

export function buildMobileChart(scope: Construct) {

  /** Penn Mobile
   * https://github.com/pennlabs/penn-mobile/blob/master/k8s/values.yaml
  */

  const secret = "penn-mobile";
    const backendImage = "pennlabs/penn-mobile-backend"
    const frontendImage = "pennlabs/penn-mobile-frontend"

    new DjangoApplication(scope, 'django', {
      deployment: {
        image: backendImage,
        secret,
        replicas: 1,
      },
      // TODO: are any of these subdomains?
      domains: [
        { host: 'studentlife.pennlabs.org', isSubdomain: true, paths: ['/']},
        { host: 'portal.pennmobile.org', isSubdomain: true, paths: ['/api', '/assets'] },
        { host: 'pennmobile.org', paths: ['/api', '/assets']},
      ],
      djangoSettingsModule: 'pennmobile.settings.production',
    });

    new ReactApplication(scope, 'react', {
      deployment: {
        image: frontendImage,
      },
      domain: { 
        host: "portal.pennmobile.org", 
        isSubdomain: true,
        paths: ['/']
      },
    });

    new CronJob(scope, 'get-laundry-snapshots', {
      schedule: cronTime.every(15).minutes(),
      image: backendImage,
      secret,
      cmd: ["python", "manage.py", "get_snapshot"],
      env: [{ name: "DJANGO_SETTINGS_MODULE", value: "pennmobile.settings.production"}]
    });
}

test('Penn Mobile', () => chartTest(buildMobileChart));
