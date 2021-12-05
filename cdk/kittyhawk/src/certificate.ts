import { Construct } from 'constructs';
import { Certificate as CertApiObject } from './imports/cert-manager.io';
import { domainToCertName, removeSubdomain, HostRules } from './ingress';
import { NonEmptyArray, nonEmptyMap } from './utils';

const CERT_ISSUER_NAME = 'wildcard-letsencrypt-prod';

export class Certificate extends Construct {
  /**
     * The schedule in Cron format.
  */
  readonly certApiObjects: NonEmptyArray<CertApiObject>;

  constructor(scope: Construct, appname: string, rules: NonEmptyArray<HostRules>) {
    super(scope, `certificate-${appname}`);

    // Still good to leave this in (see utils.ts)
    /*
    if (rules.length == 0) {
      throw new Error('Creating a certificate with an empty list of rules');
    };
    */

    // We want to generate a certificate for each host
    // TODO: see if this is okay with multiple products on same domain

    const objs: NonEmptyArray<CertApiObject> = nonEmptyMap(rules, h => {
      const hostString: string = domainToCertName(h.host, h.isSubdomain ?? false);
      const finalDomain: string = removeSubdomain(h.host, h.isSubdomain ?? false);
      return new CertApiObject(this, `certificate-${appname}-${hostString}`, {
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
    });

    this.certApiObjects = objs;
  }
}
