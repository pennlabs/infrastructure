import { Construct } from 'constructs';
import { Application } from '.';
import { DeploymentProps } from '../deployment';
import { HostRules, IngressProps } from '../ingress';
import { NonEmptyArray, nonEmptyMap } from '../utils';

export interface DjangoApplicationProps {
  /**
   * Deployment configuration
   */
  readonly deployment: DeploymentProps;

  /**
   * Port to expose the application on.
   */
  readonly port?: number;

  /**
   * Array of domain(s). Host is the domain the application runs on,
   * and isSubdomain is true if the domain should be treated as a subdomain for certificate purposes.
   * See the certificate documentation for more details.
   */
  readonly domains: NonEmptyArray<{ host: string; isSubdomain?: boolean }>;

  /**
   * Just the list of paths passed to the ingress since we already know the host. Optional.
   *
   * @default undefined
   */
  readonly ingressPaths?: string[];

  /**
   * Optional ingressProps to override the default ingress props.
   */
  readonly ingressProps?: IngressProps;

  /**
   * DJANGO_SETTINGS_MODULE environment variable.
   */
  readonly djangoSettingsModule: string;

  /**
   * Creates a service account and attach it to any deployment pods.
   * serviceAccountName: release name
   */
  readonly createServiceAccount?: boolean;
}


export default class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, props: DjangoApplicationProps) {

    // Now, we ensure there are no duplicate env variables, even if they redefine it
    const djangoExtraEnv = [...new Set([
      ...props.deployment?.env || [],
      { name: 'DJANGO_SETTINGS_MODULE', value: props.djangoSettingsModule },
      { name: 'DOMAIN', value: nonEmptyMap(props.domains, (h => h.host)).join() },
    ])];

    // Configure the ingress using ingressPaths if ingressPaths is defined.
    const djangoIngress: HostRules[] = props.domains?.map(h => ({
      host: h.host,
      paths: props.ingressPaths || [],
      isSubdomain: h.isSubdomain ?? false,
    }));

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: djangoExtraEnv,
      },
      ingress: { 
        rules: djangoIngress as NonEmptyArray<HostRules>,
        ...props.ingressProps,
       },
      createServiceAccount: props.createServiceAccount,
    });
  }
}