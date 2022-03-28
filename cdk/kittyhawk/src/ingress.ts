import { Construct } from "constructs";
import { KubeIngress as IngressApiObject, IngressRule } from "./imports/k8s";
import { NonEmptyArray, defaultChildName } from "./utils";

export interface IngressProps {
  /**
   * External port.
   *
   * @default 80
   */
  readonly port?: number;

  /**
   * A list of host rules used to configure the Ingress.
   */
  readonly rules: NonEmptyArray<HostRules>;

  /**
   * A key/value map of annotations to customize the Ingress (do path prefix routing, etc.).
   *
   * @default {}
   */
  readonly annotations?: { [key: string]: string };
}

export interface HostRules {
  /**
   * The domain for the ingress.
   */
  readonly host: string;

  /**
   * Paths on the domain that the application should be available.
   */
  readonly paths: string[];

  /**
   * If the host is a subdomain.
   */
  readonly isSubdomain?: boolean;
}

export class Ingress extends Construct {
  constructor(scope: Construct, appname: string, props: IngressProps) {
    super(scope, `ingress-${appname}`);

    const fullConfig: Required<IngressProps> = {
      port: 80,
      annotations: props.annotations ?? {},
      ...props,
    };

    const tls = props.rules.map((h) => {
      const hostString: string = `${domainToCertName(
        h.host,
        h.isSubdomain ?? false
      )}-tls`;
      return { hosts: [h.host], secretName: hostString };
    });

    const rules: IngressRule[] = props.rules.map((h) => ({
      host: h.host,
      metadata: {
        annotations: props.annotations,
      },
      http: {
        paths: h.paths.map((path) => ({
          path: path,
          pathType: "Prefix",
          backend: {
            service: {
              name: appname,
              port: {
                number: fullConfig.port,
              },
            },
          },
        })),
      },
    }));

    new IngressApiObject(this, defaultChildName, {
      metadata: {
        name: appname,
        annotations: fullConfig.annotations,
        labels: { "app.kubernetes.io/name": appname },
      },
      spec: {
        tls,
        rules,
      },
    });
  }
}

/**
 * Removes the subdomain from an url if isSubdomain is true
 * @param d the domain as a string
 * @param isSubdomain true if the url is a subdomain of a domain that already has a certificate; default to false if unspecified.
 */
export function removeSubdomain(d: string, isSubdomain = false) {
  if (isSubdomain) {
    // Must have at least 3 parts to the domain (e.g. xxx.abc.com)
    if (d.split(".").length < 3) {
      throw new Error(`No subdomain found in ${d}.`);
    }
    return d.split(".").slice(1).join(".");
  } else {
    return d;
  }
}

/**
 * Converts a domain to a dash-separated form (e.g. abc-def-org), optionally removing the subdomain.
 * @param d the domain as a string
 * @param isSubdomain true if the url is a subdomain of a domain that already has a certificate; default to false if unspecified.
 */
export function domainToCertName(d: string, isSubdomain = false) {
  // Remove everything before the 1st '.' if it is a subdomain.
  if (d.split(".").length < 2) {
    throw new Error(`Ingress creation failed: domain ${d} is invalid.`);
  }
  return removeSubdomain(d, isSubdomain).split(".").join("-");
}
