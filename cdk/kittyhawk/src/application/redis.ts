import { Construct } from "constructs";
import { DeploymentProps } from "../deployment";
import {
  KubeConfigMap,
  KubePersistentVolume,
  KubePersistentVolumeClaim,
  Quantity,
} from "../imports/k8s";
import { Application } from "./base";

export interface RedisApplicationProps {
  /**
   * Deployment configuration
   * @default {image: 'redis', tag: '6.0', port: 6379}
   */
  readonly deployment?: Partial<DeploymentProps>;

  /**
   * Port to expose the application on.
   * @default 6379
   */
  readonly port?: number;

  /**
   * Creates a service account and attach it to any deployment pods.
   * serviceAccountName: release name
   */
  readonly createServiceAccount?: boolean;

  /**
   * Persists data to a volume, using a ConfigMap to decide where to mount it.
   */
  readonly persistData?: boolean;

  /**
   * Override the default redis ConfigMap configuration and creates a custom ConfigMap object.
   */
  readonly redisConfigMap?: {
    readonly name: string;
    readonly config: string;
  };
}

export class RedisApplication extends Application {
  constructor(
    scope: Construct,
    appname: string,
    redisProps: RedisApplicationProps
  ) {
    const CONFIG_MAP_NAME = "redis-config";
    const releaseName = process.env.RELEASE_NAME || "undefined_release";

    // Persistence constants
    const storageClassName = `${releaseName}-${appname}-storage`;
    const pvName = `${releaseName}-${appname}-pv`;
    const pvcName = `${releaseName}-${appname}-pvc`;

    if (redisProps.redisConfigMap) {
      new KubeConfigMap(scope, redisProps.redisConfigMap.name, {
        metadata: {
          name: redisProps.redisConfigMap.name,
        },
        data: {
          "redis-config": redisProps.redisConfigMap.config,
        },
      });
    }

    if (redisProps.persistData) {
      new KubePersistentVolume(scope, pvName, {
        metadata: {
          name: pvName,
        },
        spec: {
          storageClassName,
          accessModes: ["ReadWriteMany"], // TODO: ask Redis folks
          capacity: {
            storage: Quantity.fromString("1Gi"),
          },
          hostPath: {
            path: `/${releaseName}/redis`,
          },
        },
      });
      new KubePersistentVolumeClaim(scope, pvcName, {
        metadata: {
          name: pvcName,
        },
        spec: {
          storageClassName,
          accessModes: ["ReadWriteMany"], // TODO: ask Redis folks
          resources: {
            requests: {
              storage: Quantity.fromString("1Gi"),
            },
          },
        },
      });
    }

    super(scope, appname, {
      deployment: {
        image: redisProps.deployment?.image ?? "redis",
        tag: redisProps.deployment?.tag ?? "6.0",
        ...(redisProps.persistData
          ? { cmd: ["redis-server", "/redis-master/redis.conf"] }
          : {}),
        volumeMounts: [
          ...(redisProps.persistData
            ? [
                {
                  name: "data",
                  mountPath: "/redis-master-data",
                },
                {
                  name: "config",
                  mountPath: "/redis-master",
                },
              ]
            : []),
          ...(redisProps.deployment?.volumeMounts ?? []),
        ],
        volumes: [
          ...(redisProps.persistData
            ? [
                {
                  name: "data",
                  persistentVolumeClaim: {
                    claimName: pvcName,
                  },
                },
                {
                  name: "config",
                  configMap: {
                    name: redisProps.redisConfigMap?.name ?? CONFIG_MAP_NAME,
                    items: [
                      {
                        key: "redis-config",
                        path: "redis.conf",
                      },
                    ],
                  },
                },
              ]
            : []),
          ...(redisProps.deployment?.volumes ?? []),
        ],
        ...redisProps.deployment,
      },
      port: redisProps.port ?? 6379,
      createServiceAccount: redisProps.createServiceAccount,
    });
  }
}
