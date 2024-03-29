import { Construct } from "constructs";
import cronTime from "cron-time-generator";
import { CronJob } from "../src/cronjob";
import { chartTest, failingTestNoGitSha } from "./utils";

export function buildCronjobVolumeChart(scope: Construct) {
  /** Tests a Cronjob with a volume. */
  new CronJob(scope, "calculate-waits", {
    schedule: cronTime.every(5).minutes(),
    image: "pennlabs/penn-courses-backend",
    secret: "penn-courses",
    cmd: ["python", "manage.py", "calculatewaittimes"],
    secretMounts: [
      {
        name: "labs-api-server",
        subPath: "ios-key",
        mountPath: "/app/ios_key.p8",
      },
    ],
  });
}

export function buildCronjobLimitsChart(scope: Construct) {
  /** Tests a Cronjob with success and failure limits. */
  new CronJob(scope, "calculate-waits", {
    schedule: cronTime.every(5).minutes(),
    image: "pennlabs/penn-courses-backend",
    secret: "penn-courses",
    cmd: ["python", "manage.py", "calculatewaittimes"],
    successLimit: 3,
    failureLimit: 3,
  });
}

export function buildCronjobWithServiceAccount(scope: Construct) {
  /** Tests a Cronjob with a service account. */
  new CronJob(scope, "calculate-waits", {
    schedule: cronTime.every(5).minutes(),
    image: "pennlabs/penn-courses-backend",
    secret: "penn-courses",
    cmd: ["python", "manage.py", "calculatewaittimes"],
    createServiceAccount: true,
  });
}

test("Cron Job with volume", () => chartTest(buildCronjobVolumeChart));

test("Cron Job with limits", () => chartTest(buildCronjobLimitsChart));

test("Cron Job -- No Git Sha", () =>
  failingTestNoGitSha(buildCronjobVolumeChart));

test("Cron Job with service account", () =>
  chartTest(buildCronjobWithServiceAccount));
