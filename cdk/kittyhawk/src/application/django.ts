import { Construct } from "constructs";
import { HostRules } from "..";
import { DeploymentProps } from "../deployment";
import { IngressProps } from "../ingress";
import { NonEmptyArray, nonEmptyMap } from "../utils";
import { Application } from "./base";

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
   * Array of domain(s).
   * Host is the domain the application runs on,
   * and isSubdomain is true if the domain should be treated as a subdomain for certificate purposes.
   * paths is the list of paths to expose the application on.
   * See the certificate documentation for more details.
   *
   * Domain is optional if the application is not publicly accessible (e.g. celery)
   */
  readonly domains?: NonEmptyArray<HostRules>;

  /**
   * Optional ingressProps to override the default ingress props.
   */
  readonly ingressProps?: Partial<Omit<IngressProps, "port">>;

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

export class DjangoApplication extends Application {
  constructor(
    scope: Construct,
    appname: string,
    props: DjangoApplicationProps
  ) {
    // Now, we ensure there are no duplicate env variables, even if they redefine it
    const djangoExtraEnv = [
      ...new Set([
        ...(props.deployment?.env || []),
        ...(props.domains
          ? [
              {
                name: "DOMAINS",
                value: nonEmptyMap(props.domains, (h) => h.host).join(),
              },
            ]
          : []),
        { name: "DJANGO_SETTINGS_MODULE", value: props.djangoSettingsModule },
      ]),
    ];

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: djangoExtraEnv,
      },
      // Configure the ingress using paths if domains is defined.
      ingress: props.domains
        ? {
            rules: nonEmptyMap(props.domains, (h) => ({
              host: h.host,
              paths: h.paths,
              isSubdomain: h.isSubdomain ?? false,
            })),
            ...props.ingressProps,
          }
        : undefined,
      createServiceAccount: props.createServiceAccount,
    });
  }
}
