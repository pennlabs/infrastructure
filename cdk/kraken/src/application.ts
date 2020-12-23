import { Workflow, JobProps, WorkflowProps, Stack } from 'cdkactions';
import { Construct } from 'constructs';
import { DeployJob, DeployJobProps } from './deploy';
import { DjangoCheckProps, DjangoCheck } from './django';
import { DockerPublish, DockerPublishProps } from './docker';
import { ReactCheck, ReactCheckProps } from './react';

export interface DjangoStackProps {
  djangoProjectName: string;
  dockerImageName: string;
  checkProps?: Partial<DjangoCheckProps>;
  checkOverrides?: Partial<JobProps>;
  dockerProps?: Partial<DockerPublishProps>;
  dockerOverrides?: Partial<JobProps>;
  deployProps?: Partial<DeployJobProps>;
  deployOverrides?: Partial<JobProps>;
}

export class DjangoStack extends Stack {
  public constructor(scope: Construct, config: DjangoStackProps, overrides?: Partial<WorkflowProps>) {
    super(scope, 'django');
    const workflow = new Workflow(this, 'build-and-deploy', {
      name: 'Build and Deploy',
      on: 'push',
      ...overrides,
    });
    new DjangoCheck(workflow,
      {
        projectName: config.djangoProjectName,
        ...config.checkProps,
      },
      config.checkOverrides);
    new DockerPublish(workflow, 'publish',
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
export interface ApplicationStackProps {
  backendPath?: string;
  frontendPath?: string;
  dockerImageBaseName: string;
  djangoProjectName: string;
  djangoCheckProps?: Partial<DjangoCheckProps>;
  djangoCheckOverrides?: Partial<JobProps>;
  djangoDockerProps?: Partial<DockerPublishProps>;
  djangoDockerOverrides?: Partial<JobProps>;
  reactCheckProps?: Partial<ReactCheckProps>;
  reactCheckOverrides?: Partial<JobProps>;
  reactDockerProps?: Partial<DockerPublishProps>;
  reactDockerOverrides?: Partial<JobProps>;
  deployProps?: Partial<DeployJobProps>;
  deployOverrides?: Partial<JobProps>;
}

export class ApplicationStack extends Stack {
  public constructor(scope: Construct, config: ApplicationStackProps, overrides?: Partial<WorkflowProps>) {
    // Build config
    const fullConfig: Required<ApplicationStackProps> = {
      backendPath: 'backend',
      frontendPath: 'frontend',
      djangoCheckProps: {},
      djangoCheckOverrides: {},
      djangoDockerProps: {},
      djangoDockerOverrides: {},
      reactCheckProps: {},
      reactCheckOverrides: {},
      reactDockerProps: {},
      reactDockerOverrides: {},
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
    new DjangoCheck(workflow,
      {
        projectName: fullConfig.djangoProjectName,
        projectLocation: fullConfig.backendPath,
        ...fullConfig.djangoCheckProps,
      },
      fullConfig.djangoCheckOverrides);
    new DockerPublish(workflow, 'publish-django',
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
    new ReactCheck(workflow, { projectLocation: fullConfig.frontendPath }, fullConfig.reactCheckOverrides);
    new DockerPublish(workflow, 'publish-react',
      {
        imageName: `${fullConfig.dockerImageBaseName}-frontend`,
        path: fullConfig.frontendPath,
        ...fullConfig.reactDockerProps,
      },
      {
        needs: 'react-check',
        ...fullConfig.reactDockerOverrides,
      });
    // Deploy
    new DeployJob(workflow, fullConfig.deployProps,
      {
        needs: ['publish-django', 'publish-react'],
        ...fullConfig.deployOverrides,
      });
  }
}
