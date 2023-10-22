import { Construct } from "constructs";
import { Application } from "../../src/application";
import { chartTest, failingTestNoGitSha } from "../utils";

export function buildTagOverrideChart(scope: Construct) {
  /** Overrides the image tag set as env var **/
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
  });
}
export function buildSimpleChart(scope: Construct) {
  /** Overrides the image tag set as env var **/
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
    },
  });
}

test("Application -- No Git Sha", () => failingTestNoGitSha(buildSimpleChart));
test("Tag Override", () => chartTest(buildTagOverrideChart));
