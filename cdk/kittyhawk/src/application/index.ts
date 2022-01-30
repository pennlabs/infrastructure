import { Construct } from 'constructs';
import { Certificate } from '../certificate';
import { Deployment, DeploymentProps } from '../deployment';
import { Ingress, IngressProps } from '../ingress';
import { Service } from '../service';
import { ServiceAccount } from '../serviceaccount';
import { nonEmptyMap } from '../utils';

import DjangoApplication from './django';
import ReactApplication from './react';
import RedisApplication from './redis';

export { DjangoApplication };
export { ReactApplication };
export { RedisApplication };

/**
 * Warning: Before editing any interfaces, make sure that none of the interfaces will have
 * property names that conflict with each other. Typescript may not throw an error and it
 * could cause problems.
 */
export interface ApplicationProps {
  readonly ingress?: IngressProps;
  readonly deployment: DeploymentProps;
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
    const release_name = process.env.RELEASE_NAME || 'undefined_release';
    const fullname = `${release_name}-${appname}`;

    new Service(this, fullname, props.port);

    if (props.createServiceAccount) {
      new ServiceAccount(this, `${appname}-${release_name}`, {
        serviceAccountName: release_name
      })
    }

    new Deployment(this, fullname, {
      ...props.deployment,
      ...(props.createServiceAccount ? { serviceAccountName: release_name } : {}),
    });

    if (props.ingress) {
      new Ingress(this, fullname, props.ingress);

      nonEmptyMap(props.ingress.rules, rule => {
        return new Certificate(this, fullname, rule);
      });
    }
  }
}