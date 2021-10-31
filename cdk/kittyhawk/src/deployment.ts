import { Construct } from 'constructs';
import { Autoscaler, AutoscalingProps } from './autoscaler';
import { Container, ContainerProps, SecretVolume } from './container';
import { IntOrString, KubeDeployment as DeploymentApiObject, VolumeMount } from './imports/k8s';

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
  readonly secretMounts?: VolumeMount[];

  /**
   * Properties for autoscaling.
   * @default - see default autoscaler props
   */
  readonly autoScalingProps?: AutoscalingProps;
  // TODO: allow multiple containers
}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, props: DeploymentProps) {
    super(scope, `deployment-${appname}`);

    const label = { name: appname };
    const containers: Container[] = [new Container(props)];
    const secretVolumes: SecretVolume[] = props.secretMounts?.map(m => new SecretVolume(m)) || [];
    const autoScalingOn: boolean = props.autoScalingProps !== undefined;

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
            maxSurge: IntOrString.fromNumber(3),
          },
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: containers,
            volumes: secretVolumes,
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
