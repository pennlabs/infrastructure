import { JobProps, Workflow } from "cdkactions";
import { DjangoCheckJob, DjangoCheckJobProps } from "./django";
import { DockerPublishJob, DockerPublishJobProps } from "./docker";
import { buildId } from "./utils";

/**
 * Props to configure the DjangoProject.
 */
export interface DjangoProjectProps {
  /**
   * A custom id to append onto job name and ids. Useful when using
   * multiple instances of DjangoProject in a single workflow.
   * @default no suffix
   */
  id?: string;

  /**
   * Name of the Django project to test.
   */
  projectName: string;

  /**
   * Location of the Django project within the repo.
   * @default "."
   */
  path?: string;

  /**
   * Docker image name to publish
   */
  imageName: string;

  /**
   * Optional props to pass to the check job.
   */
  checkProps?: Partial<DjangoCheckJobProps>;

  /**
   * Optional overrides for the check job.
   */
  checkOverrides?: Partial<JobProps>;

  /**
   * Optional props to pass to the docker publish job.
   */
  publishProps?: Partial<DockerPublishJobProps>;

  /**
   * Optional overrides for the docker publish job.
   */
  publishOverrides?: Partial<JobProps>;
}

/**
 * Creates a DjangoCheckJob and a DockerPublishJob to lint, test, build, and publish
 * a docker image of a django project. The jobs run sequentially.
 */
export class DjangoProject {
  /**
   * ID of the docker publish job.
   */
  public readonly publishJobId: string;

  /**
   * Full name of the docker image built.
   */
  public readonly dockerImageName: string;

  /**
   *
   * @param workflow cdkaction Workflow instance.
   * @param config Configuration for the django project,
   */
  public constructor(workflow: Workflow, config: DjangoProjectProps) {
    // Build config
    const fullConfig: Required<DjangoProjectProps> = {
      id: "",
      path: ".",
      checkProps: {},
      checkOverrides: {},
      publishProps: {},
      publishOverrides: {},
      ...config,
    };

    // Add jobs
    const djangoCheckJob = new DjangoCheckJob(
      workflow,
      {
        id: fullConfig.id,
        projectName: fullConfig.projectName,
        path: fullConfig.path,
        ...config.checkProps,
      },
      fullConfig.checkOverrides
    );

    const publishJob = new DockerPublishJob(
      workflow,
      buildId("backend", fullConfig.id),
      {
        imageName: fullConfig.imageName,
        path: fullConfig.path,
        ...fullConfig.publishProps,
      },
      {
        needs: djangoCheckJob.id,
        ...fullConfig.publishOverrides,
      }
    );

    // Set public fields
    this.publishJobId = publishJob.id;
    this.dockerImageName = publishJob.dockerImageName;
  }
}
