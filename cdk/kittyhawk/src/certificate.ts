import { Construct } from 'constructs';
import { Certificate as CertApiObject } from './imports/cert-manager.io';
import { IngressProps, domainToCertName, removeSubdomain } from './ingress';

export class Certificate extends Construct {
  constructor(scope: Construct, appname: string, props: IngressProps) {
    super(scope, `certificate-${appname}`);

    // Only generate certificates if an ingress is defined
    if (props.ingress) {
      // We want to generate a certificate for each host
      for (const h of props.ingress) {
        let hostString: string = domainToCertName(h.host, h.isSubdomain);
        new CertApiObject(this, `certificate-${appname}-${hostString}`, {
          metadata: {
            name: hostString,
          },
          spec: {
            secretName: hostString.concat('-tls'),
            dnsNames: [`${removeSubdomain(h.host, h.isSubdomain)}`, `*.${removeSubdomain(h.host, h.isSubdomain)}`],
            issuerRef: {
              name: 'wildcard-letsencrypt-prod',
              kind: 'ClusterIssuer',
              group: 'cert-manager.io',
            },
          },
        });
      }
    }
  }
}
