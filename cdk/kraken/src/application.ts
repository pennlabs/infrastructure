import { Workflow, JobProps, WorkflowProps, Stack, CheckoutJob } from 'cdkactions';
import { Construct } from 'constructs';
import { DeployJob, DeployJobProps } from './deploy';
import { DjangoCheckJobProps, DjangoCheckJob } from './django';
import { DockerPublishJob, DockerPublishJobProps } from './docker';
import { ReactCheckJob, ReactCheckJobProps } from './react';

/**
 * Props to configure the Django stack.
 */
export interface DjangoStackProps {

  /**
   * Name of the django project.
   */
  djangoProjectName: string;

  /**
   * Name of the docker image to publish.
   */
  dockerImageName: string;

  /**
   * Optional props to pass to the django check job.
   */
  checkProps?: Partial<DjangoCheckJobProps>;

  /**
   * Optional overrides for the django check job.
   */
  checkOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the docker publish job.
   */
  dockerProps?: Partial<DockerPublishJobProps>;

  /**
   * Optional overrides for the docker publish job.
   */
  dockerOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the deploy job.
   */
  deployProps?: Partial<DeployJobProps>;

  /**
   * Optional overrides for the deploy job.
   */
  deployOverrides?: Partial<JobProps>;
}

/**
 * A stack to deploy a standalone django project.
 */
export class DjangoStack extends Stack {
  /**
   *
   * @param scope cdkactions App instance.
   * @param config Configuration for the Django stack.
   * @param overrides Optional overrides for the workflow.
   */
  public constructor(scope: Construct, config: DjangoStackProps, overrides?: Partial<WorkflowProps>) {
    super(scope, 'django');
    const workflow = new Workflow(this, 'build-and-deploy', {
      name: 'Build and Deploy',
      on: 'push',
      ...overrides,
    });
    new DjangoCheckJob(workflow,
      {
        projectName: config.djangoProjectName,
        ...config.checkProps,
      },
      config.checkOverrides);
    new DockerPublishJob(workflow, 'publish',
      {
        imageName: config.dockerImageName,
        ...config.dockerProps,
      },
      {
        needs: 'django-check',
        ...config.dockerOverrides,
      });
    new DeployJob(workflow, config.deployProps,
      {
        needs: ['django-check', 'publish'],
        ...config.deployOverrides,
      });
  }
}

/**
 * Props to configure the Application stack
 */
export interface ApplicationStackProps {
  /**
   * Path to the django project.
   * @default "backend"
   */
  backendPath?: string;

  /**
   * Path to the react project.
   * @default "frontend"
   */
  frontendPath?: string;

  /**
   * If true, run integration tests using docker-compose.
   * @default false
   */
  integrationTests?: boolean;

  /**
   * Base name of the docker images to publish.
   * Will publish $base-frontend and $base-backend images.
   */
  dockerImageBaseName: string;

  /**
   * Name of the django project.
   */
  djangoProjectName: string;

  /**
   * Optional props to pass to the django check job.
   */
  djangoCheckJobProps?: Partial<DjangoCheckJobProps>;

  /**
   * Optional overrides for the django check job.
   */
  djangoCheckOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the django docker publish job.
   */
  djangoDockerProps?: Partial<DockerPublishJobProps>;

  /**
   * Optional overrides for the django docker publish job.
   */
  djangoDockerOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the react check job.
   */
  reactCheckProps?: Partial<ReactCheckJobProps>;

  /**
   * Optional overrides for the react check job.
   */
  reactCheckOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the react docker publish job.
   */
  reactDockerProps?: Partial<DockerPublishJobProps>;

  /**
   * Optional overrides for the react docker publish job.
   */
  reactDockerOverrides?: Partial<JobProps>;

  /**
   * Optional overrides for the integration tests job.
   */
  integrationOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the deploy job.
   */
  deployProps?: Partial<DeployJobProps>;

  /**
   * Optional overrides for the deploy job.
   */
  deployOverrides?: Partial<JobProps>;
}

/**
 * A stack to test, build, and deploy a fullstack application (Django + React).
 */
export class ApplicationStack extends Stack {
  /**
   *
   * @param scope cdkactions App instance.
   * @param config Configuration for the Application stack.
   * @param overrides Optional overrides for the workflow.
   */
  public constructor(scope: Construct, config: ApplicationStackProps, overrides?: Partial<WorkflowProps>) {
    // Build config
    const fullConfig: Required<ApplicationStackProps> = {
      backendPath: 'backend',
      frontendPath: 'frontend',
      integrationTests: false,
      djangoCheckJobProps: {},
      djangoCheckOverrides: {},
      djangoDockerProps: {},
      djangoDockerOverrides: {},
      reactCheckProps: {},
      reactCheckOverrides: {},
      reactDockerProps: {},
      reactDockerOverrides: {},
      integrationOverrides: {},
      deployProps: {},
      deployOverrides: {},
      ...config,
    };
    // Create stack
    super(scope, 'application');
    const workflow = new Workflow(this, 'build-and-deploy', {
      name: 'Build and Deploy',
      on: 'push',
      ...overrides,
    });
    const deployNeeds = fullConfig.integrationTests ? ['integration-tests'] : ['publish-django', 'publish-react'];
    // Django
    new DjangoCheckJob(workflow,
      {
        projectName: fullConfig.djangoProjectName,
        projectLocation: fullConfig.backendPath,
        ...fullConfig.djangoCheckJobProps,
      },
      fullConfig.djangoCheckOverrides);
    new DockerPublishJob(workflow, 'publish-django',
      {
        imageName: `${fullConfig.dockerImageBaseName}-backend`,
        path: fullConfig.backendPath,
        ...fullConfig.djangoDockerProps,
      },
      {
        needs: 'django-check',
        ...fullConfig.djangoDockerOverrides,
      });
    // React
    new ReactCheckJob(workflow, { projectLocation: fullConfig.frontendPath }, fullConfig.reactCheckOverrides);
    new DockerPublishJob(workflow, 'publish-react',
      {
        imageName: `${fullConfig.dockerImageBaseName}-frontend`,
        path: fullConfig.frontendPath,
        ...fullConfig.reactDockerProps,
      },
      {
        needs: 'react-check',
        ...fullConfig.reactDockerOverrides,
      });

    if (fullConfig.integrationTests) {
      // TODO: finish this
      new CheckoutJob(workflow, 'integration-tests', {
        name: 'Integration Tests',
        runsOn: 'ubuntu-latest',
        needs: ['publish-django', 'publish-react'],
        steps: [{
          name: 'Run docker compose',
          run: 'docker-compose up -d -f docker-compose.test.yaml',
        },
        {
          name: 'Populate backend',
          run: 'docker run backend python manage.py populate',
        },
        {
          name: 'Run integration tests',
          run: 'docker run frontend yarn integration',
        }],
        env: {
          GIT_SHA: '${{ github.sha }}',
        },
        ...fullConfig.integrationOverrides,
      });
    }

    // Deploy
    new DeployJob(workflow, fullConfig.deployProps,
      {
        needs: deployNeeds,
        ...fullConfig.deployOverrides,
      });
  }
}
