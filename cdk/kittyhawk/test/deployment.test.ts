import { Construct } from "constructs";
import { Container, Deployment } from "../src";
import { chartTest, failingTestNoGitSha } from "./utils";
import { KubeServiceAccount } from "../src/imports/k8s";

export function buildDeploymentDefault(scope: Construct) {
  new Deployment(scope, "container", {
    image: "pennlabs/website",
    tag: "latest",
  });
}

export function buildDeploymentWithServiceAccount(scope: Construct) {
  new Deployment(scope, "container", {
    image: "pennlabs/website",
    tag: "latest",
    serviceAccount: new KubeServiceAccount(scope, "service-account", {
      metadata: {
        name: "service-account",
      },
    }),
  });
}

export function buildContainerDefault() {
  new Container({
    image: "pennlabs/website",
    tag: "latest",
  });
}

test("Deployment -- No Git Sha", () =>
  failingTestNoGitSha(buildDeploymentDefault));
test("Deployment -- With Service Account", () =>
  chartTest(buildDeploymentWithServiceAccount));
test("Deployment -- Default", () => chartTest(buildDeploymentDefault));
test("Container -- Default", () => chartTest(buildContainerDefault));
test("Container -- No Git Sha", () =>
  failingTestNoGitSha(buildContainerDefault));
