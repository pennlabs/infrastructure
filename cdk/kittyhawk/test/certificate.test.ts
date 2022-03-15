import { Chart, Testing } from "cdk8s";
import { Construct } from "constructs";
import { Certificate } from "../src";
import { chartTest, failingTest } from "./utils";

export function buildFailingCertificateChart(scope: Construct) {
  /** If domain is invalid certificate creation should throw an error. **/
  new Certificate(scope, "serve", { host: "pennlabsorg", paths: ["/"] });
}

export function buildCertificateChart(scope: Construct) {
  /** If domain is valid certificate creation should succeed. **/
  new Certificate(scope, "serve", { host: "pennlabs.org", paths: ["/"] });
}

/** Also, the Json Patch should not remove anything if not using PennLabsChart */
export const nonPennLabsChartTest = (build: (scope: Construct) => void) => {
  // Overriding env vars for testing purposes
  process.env.RELEASE_NAME = "RELEASE_NAME";
  process.env.GIT_SHA = "TAG_FROM_CI";
  process.env.AWS_ACCOUNT_ID = "TEST_AWS_ACCOUNT_ID";

  const app = Testing.app();
  const chart = new Chart(app, "kittyhawk");
  build(chart);
  const results = Testing.synth(chart);
  expect(results).toMatchSnapshot();
};

test("Certificate -- Failing", () => failingTest(buildFailingCertificateChart));
test("Certificate -- Success", () => chartTest(buildCertificateChart));
test("Certificate (Non Penn Labs Chart) -- Success", () => nonPennLabsChartTest(buildCertificateChart));