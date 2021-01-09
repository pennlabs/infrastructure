import { Volume as VolumeInterface, Container as ContainerInterface, ContainerPort, EnvFromSource, EnvVar, Probe as ProbeInterface, VolumeMount, SecretVolumeSource, HttpGetAction, ExecAction } from '../imports/k8s';


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
  readonly extraEnv?: { name: string, value: string }[];

  /**
       * Secret mounts for deployment container.
       *
       * @default []
       */
  readonly secretMounts?: { name: string, mountPath: string, subPath: string }[]

  /**
       * Internal port.
       *
       * @default port
       */
  readonly containerPort?: number;

  /**
      * Container pull policy. 
      * 
      * @default "IfNotPresent"
      * 
      */
  readonly pullPolicy?: 'IfNotPresent' | 'Always' | 'Never';

  /**
      * Liveliness Probe definitions for the container.
      */
  readonly livenessProbe?: probeProps

  /**
      * Readiness Probe definitions for the container.
      */
  readonly readinessProbe?: probeProps

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

  /**
       * Periodic probe of container service readiness.
       */
  readonly readinessProbe?: Probe;

  /**
       * Periodic probe of container liveness. 
       */
  readonly livenessProbe?: Probe;

  constructor(props: ContainerProps) {

    this.name = 'worker'
    // Priority is tag set, GIT_SHA env var, 'latest'
    const GIT_SHA = process.env.GIT_SHA || 'latest';
    const tag = props.tag || GIT_SHA;
    this.image = `${props.image}:${tag}`;
    this.ports = [{ containerPort: props.port ?? 80 }]
    this.imagePullPolicy = props.pullPolicy || 'IfNotPresent';
    this.command = props.cmd;
    this.volumeMounts = props.secretMounts;
    this.envFrom = props.secret ? [{ secretRef: { name: props.secret } }] : undefined;
    let envVars = [...(props.extraEnv || [])];
    envVars.push({ name: 'GIT_SHA', value: GIT_SHA });
    this.env = envVars;
    this.readinessProbe = props.readinessProbe && new Probe(props.readinessProbe);
    this.livenessProbe = props.livenessProbe && new Probe(props.livenessProbe);
  }

}

export class Probe implements ProbeInterface {

  /**
       * One and only one of the following should be specified. Exec specifies the action to take.
       */
  readonly exec?: ExecAction;

  /**
       * HTTPGet specifies the http request to perform.
       */
  readonly httpGet?: HttpGetAction;

  /**
       * Number of seconds after the container has started before liveness probes are initiated. 
       */
  readonly initialDelaySeconds?: number;

  /**
       * How often (in seconds) to perform the probe. Default to 10 seconds.
       *
       */
  readonly periodSeconds?: number;

  constructor(props: probeProps) {
    this.initialDelaySeconds = props.delay ?? 1;
    this.periodSeconds = props.period ?? 10;
    if (props.command) {
      this.exec = { command: props.command }
    } else if (props.path) {
      this.httpGet = { path: props.path, port: 80 }
    } else throw new Error('Must provide either probe command or HTTP path')
  }
}

export interface VolumeProps {

  /**
       * Secret volume name. 
       */
  readonly name: string;

  /**
       * Secret volume mountPath. 
       */
  readonly mountPath: string;

  /**
       * Secret volume subPath. 
       */
  readonly subPath: string;

}


export class Volume implements VolumeInterface {

  /**
       * Name of the volume
       */
  readonly name: string;

  /**
       * Secret, stored as a volume
       *
       */
  readonly secret?: SecretVolumeSource

  constructor(props: VolumeProps) {
    let mountString = (a: string) => a.toLowerCase().split('_').join('-');

    this.name = `${mountString(props.name)}-${mountString(props.subPath)}`
    this.secret = {
      secretName: props.name,
      items: [{
        key: props.subPath,
        path: props.subPath,
      }],
    }
  }


}

