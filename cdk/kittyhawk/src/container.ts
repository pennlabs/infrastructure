import {
  Volume as VolumeInterface,
  Container as ContainerInterface,
  ContainerPort,
  EnvFromSource,
  EnvVar,
  VolumeMount,
  SecretVolumeSource,
} from "./imports/k8s";

export interface ContainerProps {
  /**
   * The Docker image to use for this service.
   */
  readonly image: string;

  /**
   * The tag for the docker image.
   */
  readonly tag?: string;

  /**
   * Number of replicas to start.
   *
   * @default 1
   */
  readonly replicas?: number;

  /**
   * Secrets for deployment.
   *
   * @default undefined
   */
  readonly secret?: string;

  /**
   * Container commands.
   *
   * @default []
   *
   */
  readonly cmd?: string[];

  /**
   * External port.
   *
   * @default 80
   */
  readonly port?: number;

  /**
   * Extra env variables.
   *
   * @default []
   */
  readonly env?: { name: string; value: string }[];
  
  /**
   * Secret mounts for deployment container.
   *
   * @default []
   */
  readonly secretMounts?: VolumeMount[];

  /**
   * Internal port.
   *
   * @default port
   */
  readonly containerPort?: number;

  /**
   * If set to true, no container ports will be specified.
   */
  readonly noContainerPorts?: boolean;

  /**
   * Container pull policy.
   *
   * @default "IfNotPresent"
   *
   */
  readonly pullPolicy?: "IfNotPresent" | "Always" | "Never";
}

export interface probeProps {
  /**
   * Sends a HTTP request to this path for the probe check. Only provide this OR a command.
   */
  readonly path?: string;

  /**
   * Comand to execute on the container for the probe. Only provide this OR a HTTP path.
   */
  readonly command?: string[];

  /**
   * Short for initialDelaySeconds: Number of seconds after the container has started before liveness or readiness probes are initiated.
   *
   * @default 0
   */
  readonly delay?: number;

  /**
   * Short for periodSeconds: How often (in seconds) to perform the probe.
   *
   * @default 10
   */
  readonly period?: number;
}

export class Container implements ContainerInterface {
  /**
   * Entrypoint array.
   */
  readonly command?: string[];

  /**
   * List of environment variables to set in the container.
   */
  readonly env?: EnvVar[];

  /**
   * List of sources to populate environment variables in the container.
   */
  readonly envFrom?: EnvFromSource[];

  /**
   * Docker image name.
   */
  readonly image?: string;

  /**
   * Image pull policy.
   */
  readonly imagePullPolicy?: string;

  /**
   * Name of the container specified as a DNS_LABEL.
   */
  readonly name: string;

  /**
   * List of ports to expose from the container.
   *
   */
  readonly ports?: ContainerPort[];

  /**
   * Pod volumes to mount into the container's filesystem.
   */
  readonly volumeMounts?: VolumeMount[];

  constructor(props: ContainerProps) {
    this.name = "worker";
    const GIT_SHA = process.env.GIT_SHA;
    if (!GIT_SHA) {
      console.error("No GIT_SHA environment variable provided.");
      process.exit(1);
    }
    const tag = props.tag || GIT_SHA;
    this.image = `${props.image}:${tag}`;
    this.ports = props.noContainerPorts
      ? undefined
      : [{ containerPort: props.port ?? 80 }];
    this.imagePullPolicy = props.pullPolicy || "IfNotPresent";
    this.command = props.cmd;
    this.volumeMounts = props.secretMounts;
    this.envFrom = props.secret
      ? [{ secretRef: { name: props.secret } }]
      : undefined;
    const env = props.env ?? [];
    this.env = [...env, { name: "GIT_SHA", value: GIT_SHA }];
  }
}

export class SecretVolume implements VolumeInterface {
  /**
   * Name of the volume
   */
  readonly name: string;

  /**
   * Secret, stored as a volume
   *
   */
  readonly secret?: SecretVolumeSource;

  constructor(props: VolumeMount) {
    let mountString = (a: string) => a.toLowerCase().split("_").join("-");
    const items = props.subPath
      ? [
          {
            key: props.subPath,
            path: props.subPath,
          },
        ]
      : [];
    this.name = `${mountString(props.name)}-${
      props.subPath && mountString(props.subPath)
    }`;
    this.secret = {
      secretName: props.name,
      items: items,
    };
  }
}
