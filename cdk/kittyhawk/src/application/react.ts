import { Construct } from "constructs";
import { DeploymentProps } from "../deployment";
import { HostRules, IngressProps } from "../ingress";
import { Application } from "./base";

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
   * Host is the domain the application runs on,
   * isSubdomain is true if the domain should be treated as a subdomain for certificate purposes.
   * paths is the list of paths to expose the application on.
   * See the certificate documentation for more details.
   *
   */
  readonly domain: HostRules;

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

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, props: ReactApplicationProps) {
    // Now, we ensure there are no duplicate env variables, even if they redefine it
    const reactExtraEnv = [
      ...new Set([
        ...(props.deployment?.env || []),
        { name: "DOMAIN", value: props.domain.host },
        { name: "PORT", value: props.portEnv || "80" },
      ]),
    ];

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: reactExtraEnv,
      },
      ingress: {
        rules: [props.domain],
        ...props.ingressProps,
      },
      createServiceAccount: props.createServiceAccount,
    });
  }
}
