import { Construct } from 'constructs';
import { KubeDeployment as DeploymentApiObject } from '../imports/k8s';
import { Autoscaler, AutoscalingProps } from './autoscaler';
import { Container, ContainerProps, Volume } from './container';

export interface DeploymentProps extends ContainerProps {
  /**
   * Number of replicas to start.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Secret volume mounts for deployment container.
   *
   * @default []
   */
  readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]

  /**
   * Properties for autoscaling. 
   * @default - see default autoscaler props
   */
  readonly autoScalingProps?: AutoscalingProps;

}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, props: DeploymentProps) {
    super(scope, `deployment-${appname}`);

    const label = { name: appname };
    const containers: Container[] = [new Container(props)];
    const volumes: Volume[] | undefined = props.secretMounts?.map(m => new Volume(m))
    const autoScalingOn : boolean = props.autoScalingProps !== undefined

    // See https://github.com/kubernetes/kubernetes/issues/25238#issuecomment-570257435 for info
    if (autoScalingOn && props.replicas !== undefined) {
      throw new Error('Cannot specify "replicaCount" when auto-scaling is enabled');
    }

    const deployment = new DeploymentApiObject(this, `deployment-${appname}`, {
      metadata: {
        name: appname,
        namespace: 'default',
        labels: label,
      },
      spec: {
        replicas: autoScalingOn ? undefined : (props.replicas ?? 1),
        selector: {
          matchLabels: label,
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxSurge: 3,
            maxUnavailable: 0,
          },
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: containers,
            volumes: volumes,
          },
        },
      },
    });

    if (autoScalingOn) {
      new Autoscaler(this, appname, {
        target: deployment,
        ...props.autoScalingProps,
      });
    }
  }
}
