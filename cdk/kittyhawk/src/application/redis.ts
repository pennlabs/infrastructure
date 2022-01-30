import { Construct } from 'constructs';
import { Application } from '.';
import { DeploymentProps } from '../deployment';

export interface RedisApplicationProps {
  /**
   * Deployment configuration
   */
  readonly deployment?: Partial<DeploymentProps>;

  /**
   * Port to expose the application on.
   */
  readonly port?: number;
  
  /**
   * Creates a service account and attach it to any deployment pods.
   * serviceAccountName: release name
   */
  readonly createServiceAccount?: boolean;
}

export default class RedisApplication extends Application {
  constructor(scope: Construct, appname: string, redisProps: RedisApplicationProps) {
    super(scope, appname, {
      deployment: {
        image: redisProps.deployment?.image ?? 'redis',
        tag: redisProps.deployment?.tag ?? '6.0',
        ...redisProps.deployment,
      },
      port: redisProps.port ?? 6379,
      createServiceAccount: redisProps.createServiceAccount,
    });
  }
}
