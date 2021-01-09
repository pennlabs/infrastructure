import { Construct } from 'constructs';
import { KubeIngressV1Beta1 as IngressApiObject, IntOrString } from '../imports/k8s';


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
  readonly ingress?: { host: string, paths: string[] }[];
}

export class Ingress extends Construct {
  constructor(scope: Construct, appname: string, props: IngressProps) {
    super(scope, `ingress-${appname}`);

    const port = props.port || 80;
    const ingress = props.ingress;

    if (ingress) {
      let tls = ingress.map(h => {
        // Regex to compute the apex domain
        const apex_domain = h.host.match(/[\w-]+\.[\w]+$/g)
        if (apex_domain) {
          const host_string = apex_domain[0].split('.').join('-').concat('-tls');
          return { hosts: [h.host], secretName: host_string }
        } else
          throw new Error(`Ingress construction failed: apex domain regex failed on ${h}`)
      })

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
              }
            }),
          },
        }
      })

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
}