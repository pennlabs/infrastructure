import { Construct } from 'constructs';
import { Certificate } from './certificate';
import { Deployment, DeploymentProps } from './deployment';
import { HostRules, Ingress, IngressProps } from './ingress';
import { Service } from './service';

/**
 * Warning: Before editing any interfaces, make sure that none of the interfaces will have
 * property names that conflict with each other. Typescript may not throw an error and it
 * could cause problems.
 */
export interface ApplicationProps {
  readonly ingress?: IngressProps;
  readonly deployment: DeploymentProps;
  readonly port?: number;
}

export interface RedisApplicationProps {
  readonly deployment?: Partial<DeploymentProps>;
  readonly port?: number;
}

export interface ReactApplicationProps {
  readonly deployment: DeploymentProps;
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
   * PORT environment variable for react. Default '80'.
   */
  readonly portEnv?: string;
}

export interface DjangoApplicationProps {
  readonly deployment: DeploymentProps;
  readonly port?: number;

  /**
   * Array of domain(s). Host is the domain the application runs on,
   * and isSubdomain is true if the domain should be treated as a subdomain for certificate purposes.
   * See the certificate documentation for more details.
   */
  readonly domains: { host: string; isSubdomain?: boolean }[];

  /**
   * Just the list of paths passed to the ingress since we already know the host. Optional.
   *
   * @default undefined
   */
  readonly ingressPaths?: string[];

  /**
   * DJANGO_SETTINGS_MODULE environment variable.
   */
  readonly djangoSettingsModule: string;
}

export class Application extends Construct {
  constructor(scope: Construct, appname: string, props: ApplicationProps) {
    super(scope, appname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME || 'undefined_release';
    const fullname = `${release_name}-${appname}`;

    new Service(this, fullname, props.port);

    new Deployment(this, fullname, props.deployment);

    if (props.ingress) {
      new Ingress(this, fullname, props.ingress);

      new Certificate(this, fullname, props.ingress.rules);
    }
  }
}

/**
 * Helper function that first checks to make sure that the environment variable array
 * doesn't already contain the env var, then inserts it into the array.
 * @param envArray array of environment variables to insert into
 * @param envKey name of the environment variable to insert
 * @param envValue value of the environment variable
 */
export function insertIfNotPresent(envArray: { name: string; value: string }[], envKey: string, envValue: any) {
  const envSettingsModule = envArray.filter(env => (env.name === envKey));
  if (envSettingsModule.length > 0) {
    throw new Error(`${envKey} should not be redefined as an environment variable.`);
  }
  envArray.push({ name: envKey, value: envValue });

}

export class DjangoApplication extends Application {
  constructor(scope: Construct, appname: string, props: DjangoApplicationProps) {

    // Have to be careful here with references when mutating things
    let djangoExtraEnv = Array.from(props.deployment?.env || []);

    // Insert DJANGO_SETTINGS_MODULE and DOMAIN
    insertIfNotPresent(djangoExtraEnv, 'DJANGO_SETTINGS_MODULE', props.djangoSettingsModule);
    insertIfNotPresent(djangoExtraEnv, 'DOMAIN', props.domains.map(h => h.host).join());

    // Configure the ingress using ingressPaths if ingressPaths is defined.
    const djangoIngress: HostRules[] = props.domains?.map(h => {
      return { host: h.host, paths: props.ingressPaths || [], isSubdomain: h.isSubdomain ?? false };
    });

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: djangoExtraEnv,
      },
      ingress: { rules: djangoIngress },
    });
  }
}

export class ReactApplication extends Application {
  constructor(scope: Construct, appname: string, props: ReactApplicationProps) {

    // Have to be careful here with references when mutating things
    let reactExtraEnv = Array.from(props.deployment.env || []);

    // Insert DOMAIN and PORT as env vars.
    insertIfNotPresent(reactExtraEnv, 'DOMAIN', props.domain);
    insertIfNotPresent(reactExtraEnv, 'PORT', props.portEnv || '80');

    // Configure the ingress using ingressPaths.
    const reactIngress = [{ host: props.domain, paths: props.ingressPaths, isSubdomain: props.isSubdomain ?? false }];

    // If everything passes, construct the Application.
    super(scope, appname, {
      port: props.port ?? 80,
      deployment: {
        ...props.deployment,
        env: reactExtraEnv,
      },
      ingress: { rules: reactIngress },
    });
  }
}

export class RedisApplication extends Application {
  constructor(scope: Construct, appname: string, redisProps: RedisApplicationProps) {
    super(scope, appname, {
      deployment: {
        image: redisProps.deployment?.image ?? 'redis',
        tag: redisProps.deployment?.tag ?? '6.0',
        ...redisProps.deployment,
      },
      port: redisProps.port || 6379,
    });
  }
}
