import { JsonPatch } from 'cdk8s';
import { Construct } from 'constructs';
import { Certificate as CertApiObject } from './imports/cert-manager.io';
import { domainToCertName, removeSubdomain, HostRules } from './ingress';

const CERT_ISSUER_NAME = 'wildcard-letsencrypt-prod';

export class Certificate extends Construct {
  constructor(scope: Construct, appname: string, rules: HostRules) {

    const hostString: string = domainToCertName(rules.host, rules.isSubdomain ?? false);
    const finalDomain: string = removeSubdomain(rules.host, rules.isSubdomain ?? false);

    super(scope, `certificate-${appname}-${hostString}`);

    const certificate = new CertApiObject(this, `certificate-${appname}-${hostString}`, {
      metadata: {
        name: hostString,
      },
      spec: {
        secretName: `${hostString}-tls`,
        dnsNames: [`${finalDomain}`, `*.${finalDomain}`],
        issuerRef: {
          name: CERT_ISSUER_NAME,
          kind: 'ClusterIssuer',
          group: 'cert-manager.io',
        },
      },
    });
    // Remove labels added by PennLabsChart
    // ~1 is an escaped version of a forward slash "/"
    certificate.addJsonPatch(JsonPatch.remove('/metadata/labels/app.kubernetes.io~1part-of'));
    certificate.addJsonPatch(JsonPatch.remove('/metadata/labels/app.kubernetes.io~1version'));
  }
}
