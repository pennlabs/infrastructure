import { Construct } from 'constructs';
import { Certificate as CertApiObject } from './imports/cert-manager.io';
import { domainToCertName, removeSubdomain, HostRules } from './ingress';

export class Certificate extends Construct {
  constructor(scope: Construct, appname: string, rules: HostRules[]) {
    super(scope, `certificate-${appname}`);

    // We want to generate a certificate for each host
    // TODO: see if this is okay with multiple products on same domain
    rules.map(h => {
      const hostString: string = domainToCertName(h.host, h.isSubdomain);
      const finalDomain: string = removeSubdomain(h.host, h.isSubdomain);
      new CertApiObject(this, `certificate-${appname}-${hostString}`, {
        metadata: {
          name: hostString,
        },
        spec: {
          secretName: `${hostString}-tls`,
          dnsNames: [`${finalDomain}`, `*.${finalDomain}`],
          issuerRef: {
            name: 'wildcard-letsencrypt-prod',
            kind: 'ClusterIssuer',
            group: 'cert-manager.io',
          },
        },
      });
    });
  }
}
