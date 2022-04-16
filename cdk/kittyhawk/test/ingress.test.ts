import { Construct } from "constructs";
import { domainToCertName, removeSubdomain } from "../src";
import { Application } from "../src/application";
import { chartTest, failingTest } from "./utils";

/*
Ingress Port Behavior 

1. NEITHER: Default Behavior
If `port` IS NOT specified in neither `Application` nor `ingressProps`, 
continue with default behavior in `Application` and other children objects 
created. For `Ingress`, the default port is assumed.

2. In Application, Not Ingress: Inherits Application port
If `port` IS NOT specified in `Application` and `port` IS specified in `ingressProps`, 
the ingress port value is used for the `Ingress`

3. In Ingress, Not Application: Throw Error
- If `port` IS specified in `Application` and `port` IS NOT specified in `ingressProps`, 
throw an erorr for defining a custom ingress port but a different port being assumed by the application.

4. BOTH: Ingress Port Overrides Application
- If `port` IS specified in both `Application` and `ingressProps`, the ingress port value
 overrides the application port specified for the `Ingress`.
*/

export function buildDefaultIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
  });
}

export function buildCustomApplicationPortIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    ingress: { rules: [{ host: "pennlabs.org", paths: ["/"] }] },
    port: 443,
  });
}

export function buildFailingCustomIngressPortIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    ingress: {
      port: 443,
      rules: [{ host: "pennlabs.org", paths: ["/"] }],
    },
  });
}

export function buildCustomPortInBothOverrideIngressChart(scope: Construct) {
  new Application(scope, "serve", {
    deployment: {
      image: "pennlabs/website",
      tag: "latest",
    },
    port: 8080,
    ingress: {
      port: 443,
      rules: [{ host: "pennlabs.org", paths: ["/"] }],
    },
  });
}

test("Ingress -- Default (1)", () => chartTest(buildDefaultIngressChart));

test("Ingress -- Custom Application Port (2)", () =>
  chartTest(buildCustomApplicationPortIngressChart));

test("Ingress -- Custom Ingress Port (3, fails)", () =>
  failingTest(buildFailingCustomIngressPortIngressChart));

test("Ingress -- Custom Ports for Both (4)", () =>
  chartTest(buildCustomPortInBothOverrideIngressChart));

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
