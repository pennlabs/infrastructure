import { Construct } from "constructs";
import { domainToCertName, removeSubdomain } from "../src";
import { Application } from "../src/application";
import { failingTest } from "./utils";

export function buildFailingIngressChart(scope: Construct) {
  /** Incorrect ingress host string should fail**/
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    ingress: {
      rules: [{ host: "pennlabsorg", paths: ["/"] }],
    },
  });
}

test("Ingress Regex -- Failing", () => failingTest(buildFailingIngressChart));

// Tests for the helper functions in ingress.ts
test("Remove subdomain -- true", () => {
  expect(removeSubdomain("platform.pennlabs.org", true)).toEqual(
    "pennlabs.org"
  );
});

test("Remove subdomain -- false", () => {
  expect(removeSubdomain("abc.platform.pennlabs.org", false)).toEqual(
    "abc.platform.pennlabs.org"
  );
  expect(removeSubdomain("ohq.io")).toEqual("ohq.io");
});

test("Remove subdomain should fail if none exists", () => {
  expect(() => removeSubdomain("pennlabs.org", true)).toThrow(
    "No subdomain found in pennlabs.org."
  );
});

test("domainToCertName subdomain", () => {
  expect(domainToCertName("platform.pennlabs.org", true)).toEqual(
    "pennlabs-org"
  );
});

test("domainToCertName non-subdomain", () => {
  expect(domainToCertName("hub.provost.upenn.edu")).toEqual(
    "hub-provost-upenn-edu"
  );
});

test("domainToCertName fails on invalid domain", () => {
  expect(() => domainToCertName("pennlabsorg")).toThrow(
    "Ingress creation failed: domain pennlabsorg is invalid."
  );
});
