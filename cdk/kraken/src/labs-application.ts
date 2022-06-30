import { Workflow, JobProps, WorkflowProps, Stack } from "cdkactions";
import { Construct } from "constructs";
import { DeployJob, DeployJobProps } from "./deploy";
import { DjangoCheckJobProps } from "./django";
import { DjangoProject } from "./django-project";
import { DockerPublishJobProps } from "./docker";
import {
  IntegrationTestsJob,
  IntegrationTestsJobProps,
} from "./integration-tests";
import { NukeJob } from "./nuke";
import { ReactCheckJobProps } from "./react";
import { ReactProject } from "./react-project";
import { defaultBranch } from "./utils";

/**
 * Props to configure the LabsApplication stack
 */
export interface LabsApplicationStackProps {
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
   * If true, workflows for feature branch deployment will be generated.
   * @default false
   */
  enableFeatureBranchDeploy?: boolean;

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
   * Optional props to pass to the integration tests job.
   */
  integrationProps?: Partial<IntegrationTestsJobProps>;

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

  /**
   * Urls sent in a message once deployment successfully completes.
   */
  deploymentUrls?: string[];
}

/**
 * A stack that will lint, test, build, publish docker images for, and deploy both a
 * Django project and a React project. This stack will also optionally run integration
 * tests before deploying.
 *
 * By default the docker images will be published as $dockerImageBaseName-backend and
 * $dockerImageBaseName-frontend
 */
export class LabsApplicationStack extends Stack {
  /**
   *
   * @param scope cdkactions App instance.
   * @param config Configuration for the LabsApplication stack.
   * @param overrides Optional overrides for the workflow.
   */
  public constructor(
    scope: Construct,
    config: LabsApplicationStackProps,
    overrides?: Partial<WorkflowProps>
  ) {
    // Build config
    const fullConfig: Required<LabsApplicationStackProps> = {
      backendPath: "backend",
      frontendPath: "frontend",
      enableFeatureBranchDeploy: false,
      integrationTests: false,
      djangoCheckProps: {},
      djangoCheckOverrides: {},
      djangoDockerProps: {},
      djangoDockerOverrides: {},
      reactCheckProps: {},
      reactCheckOverrides: {},
      reactDockerProps: {},
      reactDockerOverrides: {},
      integrationProps: {},
      integrationOverrides: {},
      deployProps: {},
      deployOverrides: {},
      deploymentUrls: [],
      ...config,
    };
    fullConfig.djangoDockerProps.noPublish = fullConfig.integrationTests;
    fullConfig.reactDockerProps.noPublish = fullConfig.integrationTests;

    if (config.enableFeatureBranchDeploy) {
      const publishCondition = `\${{ github.ref == 'refs/heads/${
        fullConfig.deployProps.defaultBranch ?? defaultBranch
      }' || startsWith(github.ref, 'refs/heads/feat/') == true }}`;

      fullConfig.reactDockerProps.push = publishCondition;
      fullConfig.djangoDockerProps.push = publishCondition;
    }

    // Create stack
    super(scope, "application");
    const workflow = new Workflow(this, "build-and-deploy", {
      name: "Build and Deploy",
      on: "push",
      ...overrides,
    });

    // Django
    const djangoProject = new DjangoProject(workflow, {
      projectName: fullConfig.djangoProjectName,
      path: fullConfig.backendPath,
      imageName: `${fullConfig.dockerImageBaseName}-backend`,
      checkProps: fullConfig.djangoCheckProps,
      checkOverrides: fullConfig.djangoCheckOverrides,
      publishProps: fullConfig.djangoDockerProps,
      publishOverrides: fullConfig.djangoDockerOverrides,
    });

    // React
    const reactProject = new ReactProject(workflow, {
      path: fullConfig.frontendPath,
      imageName: `${fullConfig.dockerImageBaseName}-frontend`,
      checkProps: fullConfig.reactCheckProps,
      checkOverrides: fullConfig.reactCheckOverrides,
      publishProps: fullConfig.reactDockerProps,
      publishOverrides: fullConfig.reactDockerOverrides,
    });

    let deployNeeds: string[];
    if (fullConfig.integrationTests) {
      const integrationTest = new IntegrationTestsJob(
        workflow,
        {
          dockerBuildIds: [
            djangoProject.publishJobId,
            reactProject.publishJobId,
          ],
          dockerImages: [
            djangoProject.dockerImageName,
            reactProject.dockerImageName,
          ],
          testCommand: 'echo "Add an integration test command" && exit 1',
          ...fullConfig.integrationProps,
        },
        {
          ...fullConfig.integrationOverrides,
          needs: [djangoProject.publishJobId, reactProject.publishJobId],
        }
      );
      deployNeeds = [integrationTest.finalJobId];
    } else {
      deployNeeds = [djangoProject.publishJobId, reactProject.publishJobId];
    }

    // Deploy
    new DeployJob(workflow, fullConfig.deployProps, {
      ...fullConfig.deployOverrides,
      needs: deployNeeds,
    });

    // Feature Branch Deploy
    if (fullConfig.enableFeatureBranchDeploy) {
      // Add Feature Branch Deploy to Original Workflow
      new DeployJob(
        workflow,
        {
          ...fullConfig.deployProps,
          deployToFeatureBranch: true,
          deploymentUrls: fullConfig.deploymentUrls,
        },
        {
          ...fullConfig.deployOverrides,
          needs: deployNeeds,
        }
      );

      // New Feature Branch Nuke Worflow
      const featureBranchNukeWorkflow = new Workflow(
        this,
        "feature-branch-nuke",
        {
          name: "Feature Branch Nuke",
          on: {
            pullRequest: {
              types: ["closed"],
              branches: ["feat/**"],
            },
          },
          ...overrides,
        }
      );

      new NukeJob(featureBranchNukeWorkflow, fullConfig.deployProps, {
        ...fullConfig.deployOverrides,
      });
    }
  }
}
