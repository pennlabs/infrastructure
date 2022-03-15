import { Construct } from "constructs";
import { DeploymentProps } from "../deployment";
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
}

export class RedisApplication extends Application {
  constructor(
    scope: Construct,
    appname: string,
    redisProps: RedisApplicationProps
  ) {
    super(scope, appname, {
      deployment: {
        image: redisProps.deployment?.image ?? "redis",
        tag: redisProps.deployment?.tag ?? "6.0",
        ...redisProps.deployment,
      },
      port: redisProps.port ?? 6379,
      createServiceAccount: redisProps.createServiceAccount,
    });
  }
}
