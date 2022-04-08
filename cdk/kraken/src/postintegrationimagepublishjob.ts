import { CheckoutJob, Workflow, JobProps } from "cdkactions";

/**
 * Props to configure the post integration test docker image publish job.
 */
export interface PostIntegrationPublishJobProps {
  /**
   * Branch to restrict publishing to
   * @default master
   */
  defaultBranch?: string;

  /**
   * A list of job IDs that built docker images.
   */
  dockerBuildIds: string[];

  /**
   * A list of the docker images to publish.
   */
  dockerImages: string[];

  /**
   * Username to authenticate with Docker Hub.
   * @default load the "DOCKER_USERNAME" GitHub Actions secret.
   */
  dockerUsername?: string;

  /**
   * Password to authenticate with Docker Hub.
   * @default load the "DOCKER_PASSWORD" GitHub Actions secret.
   */
  dockerPassword?: string;
}

/**
 * A job to publish Docker images after completing an integration test.
 */
export class PostIntegrationPublishJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param id Id of the job.
   * @param config Configuration for the post integration tests publish job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(
    scope: Workflow,
    config: PostIntegrationPublishJobProps,
    overrides?: Partial<JobProps>
  ) {
    // Build config
    const fullConfig: Required<PostIntegrationPublishJobProps> = {
      defaultBranch: "master",
      dockerUsername: "${{ secrets.DOCKER_USERNAME }}",
      dockerPassword: "${{ secrets.DOCKER_PASSWORD }}",
      ...config,
    };

    // Create job
    super(scope, "post-integration-publish", {
      name: "Publish Images",
      runsOn: "ubuntu-latest",
      if: `github.ref == 'refs/heads/${fullConfig.defaultBranch}'`,
      steps: [
        {
          uses: "actions/download-artifact@v2",
        },
        {
          uses: "geekyeggo/delete-artifact@v1",
          with: {
            name: fullConfig.dockerBuildIds.join("\n"),
          },
        },
        {
          name: "Load docker images",
          run: fullConfig.dockerBuildIds
            .map((id) => `docker load --input ${id}/image.tar`)
            .join("\n"),
        },
        {
          uses: "docker/login-action@v1",
          with: {
            username: fullConfig.dockerUsername,
            password: fullConfig.dockerPassword,
          },
        },
        {
          name: "Push docker images",
          run: fullConfig.dockerImages
            .map((image) => `docker push -a ${image}`)
            .join("\n"),
        },
      ],
      ...overrides,
    });
  }
}
