import { Construct } from "constructs";
import { domainToCertName, removeSubdomain } from "../src";
import { Application } from "../src/application";
import { chartTest, failingTest } from "./utils";

/*
Ingress Port Behavior 

For the application, the ingress port should never be explicitly defined. This is because the
application port must be uniform with the ingress port provided. 

1. Default Behavior
If `port` IS NOT specified in `Application`, continue with default behavior in `Application` 
and other children objects created. For `Ingress`, the default port is assumed.

2. In Application, Not Ingress: Inherits Application port
If `port` is specified in `Application`, the port value is used for the `Ingress` and `Application`.
*/

export function buildDefaultIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    ingress: { rules: [{ host: "pennlabs.org", paths: ["/"] }] },
  });
}

export function buildCustomPortIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    ingress: { rules: [{ host: "pennlabs.org", paths: ["/"] }] },
    port: 443,
  });
}

test("Ingress -- Default (1)", () => chartTest(buildDefaultIngressChart));

test("Ingress -- Custom Port (2)", () =>
  chartTest(buildCustomPortIngressChart));

// Failing Ingress Behavior
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
