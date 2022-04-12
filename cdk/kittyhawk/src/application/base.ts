import { Construct } from "constructs";
import { removeSubdomain } from "..";
import { Certificate } from "../certificate";
import { Deployment, DeploymentProps } from "../deployment";
import { Ingress, IngressProps } from "../ingress";
import { Service } from "../service";
import { ServiceAccount } from "../serviceaccount";

export interface ApplicationProps {
  /**
   * Ingress configuration
   */
  readonly ingress?: IngressProps;

  /**
   * Deployment configuration
   */
  readonly deployment: DeploymentProps;

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

export class Application extends Construct {
  constructor(scope: Construct, appname: string, props: ApplicationProps) {
    super(scope, appname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME || "undefined_release";
    const fullname = `${release_name}-${appname}`;

    new Service(this, fullname, props.port);

    if (props.createServiceAccount) {
      new ServiceAccount(this, `${appname}-${release_name}`, {
        serviceAccountName: release_name,
      });
    }

    new Deployment(this, fullname, {
      ...props.deployment,
      port: props.port,
      ...(props.createServiceAccount
        ? { serviceAccountName: release_name }
        : {}),
    });

    if (props.ingress) {
      new Ingress(this, fullname, props.ingress);

      const alreadyCreatedCertificates = new Set<string>();

      props.ingress.rules.forEach((rules) => {
        const finalDomain: string = removeSubdomain(
          rules.host,
          rules.isSubdomain ?? false
        );
        if (!alreadyCreatedCertificates.has(finalDomain)) {
          new Certificate(this, fullname, rules);
          alreadyCreatedCertificates.add(finalDomain);
        }
      });
    }
  }
}
