import { Construct } from "constructs";
import { Container, ContainerProps, SecretVolume } from "./container";
import {
  IntOrString,
  KubeDeployment as DeploymentApiObject,
  KubeServiceAccount,
  VolumeMount,
  Volume,
} from "./imports/k8s";
import { defaultChildName } from "./utils";

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
   * Volume mounts for deployment container.
   *
   * This appends to the existing list of volumes, if created by the `secretMounts` property.
   *
   * @default []
   */
  readonly volumeMounts?: VolumeMount[];

  /**
   * Volume mounts for deployment container.
   */
  readonly volumes?: Volume[];

  /**
   * The service account to be used to attach to any deployment pods.
   * Default serviceAccountName: release name
   */
  readonly serviceAccount?: KubeServiceAccount;
}

export class Deployment extends Construct {
  constructor(scope: Construct, appname: string, props: DeploymentProps) {
    super(scope, `deployment-${appname}`);

    const label = { "app.kubernetes.io/name": appname };
    const containers: Container[] = [new Container(props)];
    const secretVolumes: SecretVolume[] =
      props.secretMounts?.map((m) => new SecretVolume(m)) || [];

    new DeploymentApiObject(this, defaultChildName, {
      metadata: {
        name: appname,
        labels: label,
      },
      spec: {
        replicas: props.replicas ?? 1,
        selector: {
          matchLabels: label,
        },
        strategy: {
          type: "RollingUpdate",
          rollingUpdate: {
            maxSurge: IntOrString.fromNumber(3),
            maxUnavailable: IntOrString.fromNumber(0),
          },
        },
        template: {
          metadata: { labels: label },
          spec: {
            // The next line checks if serviceAccount exists, and adds it to serviceAccountName
            ...(props.serviceAccount
              ? { serviceAccountName: props.serviceAccount.name }
              : {}),
            containers: containers,
            volumes: [...secretVolumes, ...(props.volumes || [])],
          },
        },
      },
    });
  }
}
