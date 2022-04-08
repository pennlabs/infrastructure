import { JobProps, Workflow } from "cdkactions";
import { DockerPublishJob, DockerPublishJobProps } from "./docker";
import { ReactCheckJob, ReactCheckJobProps } from "./react";
import { buildId } from "./utils";

/**
 * Props to configure the ReactProject.
 */
export interface ReactProjectProps {
  /**
   * A custom id to append onto job name and ids. Useful when using
   * multiple instances of ReactProject in a single workflow.
   * @default no suffix
   */
  id?: string;

  /**
   * Location of the React project within the repo.
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
  checkProps?: Partial<ReactCheckJobProps>;

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
 * Creates a ReactCheckJob and a DockerPublishJob to lint, test, build, and publish
 * a docker image of a react project. The jobs run sequentially.
 */
export class ReactProject {
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
   * @param config Configuration for the react project,
   */
  public constructor(workflow: Workflow, config: ReactProjectProps) {
    // Build config
    const fullConfig: Required<ReactProjectProps> = {
      id: "",
      path: ".",
      checkProps: {},
      checkOverrides: {},
      publishProps: {},
      publishOverrides: {},
      ...config,
    };

    // Add jobs
    const reactCheckJob = new ReactCheckJob(
      workflow,
      {
        id: fullConfig.id,
        path: fullConfig.path,
        ...config.checkProps,
      },
      fullConfig.checkOverrides
    );

    const publishJob = new DockerPublishJob(
      workflow,
      buildId("frontend", fullConfig.id),
      {
        imageName: fullConfig.imageName,
        path: fullConfig.path,
        ...fullConfig.publishProps,
      },
      {
        needs: reactCheckJob.id,
        ...fullConfig.publishOverrides,
      }
    );

    // Set public fields
    this.publishJobId = publishJob.id;
    this.dockerImageName = publishJob.dockerImageName;
  }
}
