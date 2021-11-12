import { Construct } from 'constructs';
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
  
  // TODO: allow multiple containers
}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, props: DeploymentProps) {
    super(scope, `deployment-${appname}`);

    const label = { name: appname };
    const containers: Container[] = [new Container(props)];
    const secretVolumes: SecretVolume[] = props.secretMounts?.map(m => new SecretVolume(m)) || [];

    // TODO is this needed? since we don't call it anywhere
    const _deployment = new DeploymentApiObject(this, `deployment-${appname}`, {
      metadata: {
        name: appname,
        namespace: 'default',
        labels: label,
      },
      spec: {
        replicas: props.replicas ?? 1,
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
  }
}
