import { Construct } from "constructs";
import { Container, Deployment } from "../src";
import { chartTest, failingTestNoGitSha } from "./utils";

export function buildDeploymentDefault(scope: Construct) {
  new Deployment(scope, "container", {
    image: "pennlabs/website",
    tag: "latest",
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
test("Deployment -- Default", () => chartTest(buildDeploymentDefault));
