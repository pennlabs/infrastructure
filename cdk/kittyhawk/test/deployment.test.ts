import { Construct } from "constructs";
import { Container, Deployment } from "../src";
import { KubeServiceAccount } from "../src/imports/k8s";
import { chartTest, failingTestNoGitSha } from "./utils";

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
  failingContainerTestNoGitSha(buildContainerDefault));

export const failingContainerTestNoGitSha = (_: (scope: Construct) => void) => {
  const { GIT_SHA, ...env } = process.env;

  process.env = {
    ...env,
    RELEASE_NAME: "RELEASE_NAME",
    AWS_ACCOUNT_ID: "TEST_AWS_ACCOUNT_ID",
  };

  expect(() => {
    buildContainerDefault();
  }).toThrowError("process.exit: 1");
};
