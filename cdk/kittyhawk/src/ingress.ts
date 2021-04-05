import { Construct } from 'constructs';
import { KubeIngressV1Beta1 as IngressApiObject, IntOrString } from './imports/k8s';


export interface IngressProps {
  /**
     * External port.
     *
     * @default 80
     */
  readonly port?: number;

  /**
     * A list of host rules used to configure the Ingress.
     *
     * @default undefined
     */
  readonly ingress?: HostRules[];
}

export interface HostRules {
  /**
   * The domain for the ingress.
   */
  readonly host: string;

  /**
   * Paths on the domain that the application should be avaiable.
   */
  readonly paths: string[];

  /**
   * If the host is a subdomain.
   */
  readonly isSubdomain: boolean;
}

export class Ingress extends Construct {
  constructor(scope: Construct, appname: string, props: IngressProps) {
    super(scope, `ingress-${appname}`);

    const port = props.port || 80;
    const ingress = props.ingress;

    if (!ingress) {
      throw new Error('Cannot generate ingress if props.ingress is undefined.');
    }
    let tls = ingress.map(h => {
      let hostString: string = domainToCertName(h.host, h.isSubdomain).concat('-tls');
      return { hosts: [h.host], secretName: hostString };
    });

    let rules = ingress.map(h => {
      return {
        host: h.host,
        http: {
          paths: h.paths.map(path => {
            return {
              path: path,
              backend: {
                serviceName: appname,
                servicePort: IntOrString.fromNumber(port),
              },
            };
          }),
        },
      };
    });

    new IngressApiObject(this, `ingress-${appname}`, {
      metadata: {
        name: appname,
        namespace: 'default',
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
 * @param isSubdomain true if the url is a subdomain of a domain that already has a certificate.
 */
export function removeSubdomain(d: string, isSubdomain: boolean) {
  if (isSubdomain) {
    // Must have at least 3 parts to the domain (e.g. xxx.abc.com)
    if (d.split('.').length < 3) {
      throw new Error(`No subdomain found in ${d}.`);
    }
    return d.split('.').slice(1).join('.');
  } else {
    return d;
  }
}

/**
 * Converts a domain to a dash-separated form (e.g. abc-def-org), optionally removing the subdomain.
 * @param d the domain as a string
 * @param isSubdomain true if the url is a subdomain of a domain that already has a certificate.
 */
export function domainToCertName(d: string, isSubdomain: boolean) {
  // Remove everything before the 1st '.' if it is a subdomain.
  if (d.split('.').length < 2) {
    throw new Error(`Ingress creation failed: domain ${d} is invalid.`);
  }
  return removeSubdomain(d, isSubdomain).split('.').join('-');
}