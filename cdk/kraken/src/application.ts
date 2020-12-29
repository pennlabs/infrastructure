import { Workflow, JobProps, WorkflowProps, Stack, CheckoutJob } from 'cdkactions';
import { Construct } from 'constructs';
import { DeployJob, DeployJobProps } from './deploy';
import { DjangoCheckJobProps } from './django';
import { DjangoProject } from './django-project';
import { DockerPublishJobProps } from './docker';
import { ReactCheckJobProps } from './react';
import { ReactProject } from './react-project';


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
  djangoCheckProps?: Partial<DjangoCheckJobProps>;

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
      djangoCheckProps: {},
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

    // Django
    const djangoProject = new DjangoProject(workflow,
      {
        projectName: fullConfig.djangoProjectName,
        path: fullConfig.backendPath,
        imageName: `${fullConfig.dockerImageBaseName}-backend`,
        checkProps: fullConfig.djangoCheckProps,
        checkOverrides: fullConfig.djangoCheckOverrides,
        publishProps: fullConfig.djangoDockerProps,
        publishOverrides: fullConfig.djangoDockerOverrides,
      });

    // React
    const reactProject = new ReactProject(workflow,
      {
        path: fullConfig.frontendPath,
        imageName: `${fullConfig.dockerImageBaseName}-frontend`,
        checkProps: fullConfig.reactCheckProps,
        checkOverrides: fullConfig.reactCheckOverrides,
        publishProps: fullConfig.reactDockerProps,
        publishOverrides: fullConfig.reactDockerOverrides,
      },
    );

    const integrationTestsId = 'integration-tests';
    if (fullConfig.integrationTests) {
      // TODO: finish this
      new CheckoutJob(workflow, integrationTestsId, {
        name: 'Integration Tests',
        runsOn: 'ubuntu-latest',
        needs: [djangoProject.publishJobId, reactProject.publishJobId],
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
    const deployNeeds = fullConfig.integrationTests ? [integrationTestsId] : [djangoProject.publishJobId, reactProject.publishJobId];
    new DeployJob(workflow, fullConfig.deployProps,
      {
        needs: deployNeeds,
        ...fullConfig.deployOverrides,
      });
  }
}
