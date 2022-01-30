import { Construct } from 'constructs';
import { Application } from '.';
import { DeploymentProps } from '../deployment';
import { HostRules, IngressProps } from '../ingress';
import { NonEmptyArray } from '../utils';

export interface ReactApplicationProps {
  /**
   * Deployment configuration
   */
  readonly deployment: DeploymentProps;

  /**
   * Port to expose the application on.
   */
  readonly port?: number;

  /**
   * Domain of the application.
   */
  readonly domain: string;

  /**
   * If the host is a subdomain.
   */
  readonly isSubdomain?: boolean;

  /**
   * Just the list of paths passed to the ingress since we already know the host.
   */
  readonly ingressPaths: string[];

  /**
   * Optional ingressProps to override the default ingress props.
   */
  readonly ingressProps?: IngressProps;

  /**
   * PORT environment variable for react. Default '80'.
   */
  readonly portEnv?: string;

  /**
   * Creates a service account and attach it to any deployment pods.
   * serviceAccountName: release name
   */
  readonly createServiceAccount?: boolean;
}


export default class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, props: ReactApplicationProps) {
    // Now, we ensure there are no duplicate env variables, even if they redefine it
    const reactExtraEnv = [...new Set([
      ...props.deployment?.env || [],
      { name: 'DOMAIN', value: props.domain },
      { name: 'PORT', value: props.portEnv || '80' },
    ])];

    // Configure the ingress using ingressPaths.
    const reactIngress: NonEmptyArray<HostRules> = [{ host: props.domain, paths: props.ingressPaths, isSubdomain: props.isSubdomain ?? false }];

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: reactExtraEnv,
      },
      ingress: { 
        rules: reactIngress,
        ...props.ingressProps,
       },
      createServiceAccount: props.createServiceAccount,
    });
  }
}