import { Construct } from 'constructs';
import cronTime from 'cron-time-generator';
import { DjangoApplication, ReactApplication } from '../../src/application';
import { CronJob } from '../../src/cronjob';
import { NonEmptyArray } from '../../src/utils';
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
      cmd: ['/usr/local/bin/asgi-run'],
      replicas: 2,
    },
    // TODO: are any of these subdomains?
    domains: [
      { host: 'studentlife.pennlabs.org' },
      { host: 'pennmobile.org' },
      { host: 'portal.pennmobile.org' }] as NonEmptyArray<{ host: string; isSubdomain?: boolean }>,
    // TODO: it seems to be configuring these paths for all of the domains, which is kinda sus
    ingressPaths: ['/','/api', '/assets'],
    djangoSettingsModule: 'pennmobile.settings.production',
  });

  new ReactApplication(scope, 'react', {
    deployment: {
      image: frontendImage,
    },
    domain: "portal.pennmobile.org",
    ingressPaths: ['/'],
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
