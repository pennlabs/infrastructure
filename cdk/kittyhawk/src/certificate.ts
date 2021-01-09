import { Construct } from 'constructs';
import { Certificate as CertApiObject } from '../imports/cert-manager.io/certificate';
import { IngressProps } from './ingress';

export class Certificate extends Construct {
  constructor(scope: Construct, appname: string, props: IngressProps) {
    super(scope, `certificate-${appname}`);

    // Only generate certificates if an ingress is defined
    if (props.ingress) {
      // We want to generate a certificate for each host
      for (const h of props.ingress) {
        // Regex to compute the apex domain
        const apex_domain = h.host.match(/[\w-]+\.[\w]+$/g)
        if (apex_domain != null) {
          let host_string = apex_domain[0].split('.').join('-');
          new CertApiObject(this, `certificate-${appname}-${host_string}`, {
            metadata: {
              name: host_string,
            },
            spec: {
              secretName: host_string.concat('-tls'),
              dnsNames: [`${apex_domain[0]}`, `*.${apex_domain[0]}`],
              issuerRef: {
                name: 'wildcard-letsencrypt-prod',
                kind: 'ClusterIssuer',
                group: 'cert-manager.io',
              },
            },
          });
        } else
          throw `Certificate construction failed: apex domain regex failed on ${h}`
      }
    }
  }
}