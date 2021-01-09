import { Construct } from 'constructs';
import { KubeService as ServiceApiObject, IntOrString } from '../imports/k8s';


export interface ServiceProps {
  /**
   * External port.
   *
   * @default 80
   */
  readonly port?: number;

  /**
* Internal port.
*
* @default port
*/
  readonly containerPort?: number;
}


export class Service extends Construct {
  constructor(scope: Construct, appname: string, props: ServiceProps) {
    super(scope, `service-${appname}`);

    const port = props.port || 80;
    const containerPort = props.containerPort || port;

    new ServiceApiObject(this, `service-${appname}`, {
      metadata: {
        name: appname,
      },
      spec: {
        type: 'ClusterIP',
        ports: [{ port, targetPort: IntOrString.fromNumber(containerPort) }],
        selector: { name: appname },
      },
    });

  }
}