import { Construct } from "constructs";
import cronTime from "cron-time-generator";
import { CronJob } from "../src/cronjob";
import { chartTest } from "./utils";

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

test("Cron Job with volume", () => chartTest(buildCronjobVolumeChart));
test("Cron Job for feature branch deploy", () => {
  process.env.DEPLOY_TO_FEATURE_BRANCH = "true";
  chartTest(buildCronjobVolumeChart);
});
test("Cron Job with limits", () => chartTest(buildCronjobLimitsChart));
afterEach(() => {
  delete process.env.DEPLOY_TO_FEATURE_BRANCH;
});
