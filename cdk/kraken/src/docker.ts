import { CheckoutJob, Workflow, JobProps } from 'cdkactions';

/**
 * Props to configure the Docker publish job.
 */
export interface DockerPublishJobProps {
  /**
   * Image name to publish
   */
  imageName: string;

  /**
   * Path to the docker context
   * @default "."
   */
  path?: string;

  /**
   * A condition on when to push the built image.
   * @default Only push on master.
   */
  push?: string;

  /**
   * Tags to apply to the built image.
   * @default latest and the current git sha.
   */
  tags?: string;

  /**
   * Username to authenticate with Docker Hub.
   * @default load the "DOCKER_USERNAME" GitHub Actions secret.
   */
  username?: string;

  /**
   * Password to authenticate with Docker Hub.
   * @default load the "DOCKER_PASSWORD" GitHub Actions secret.
   */
  password?: string;

  /**
   * If enabled, will cache_from the latest version of the docker image.
   * @default true
   */
  cache?: boolean;
}

/**
 * A job to build and publish a Docker image.
 * TODO: look into docker build action v2
 */
export class DockerPublishJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param id Id of the job.
   * @param config Configuration for the docker publish job.
   * @param overrides Optional overrices for the job.
   */
  public constructor(scope: Workflow, id: string, config: DockerPublishJobProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<DockerPublishJobProps> = {
      path: '.',
      push: "${{ github.ref == 'refs/heads/master' }}",
      tags: 'latest,${{ github.sha }}',
      username: '${{ secrets.DOCKER_USERNAME }}',
      password: '${{ secrets.DOCKER_PASSWORD }}',
      cache: true,
      ...config,
    };
    // Define docker action with
    const dockerWith: any = {
      repository: `pennlabs/${fullConfig.imageName}`,
      path: fullConfig.path,
      username: fullConfig.username,
      password: fullConfig.password,
      push: fullConfig.push,
      tags: fullConfig.tags,
    };
    if (fullConfig.cache) {
      dockerWith.cache_froms = `${dockerWith.repository}:latest`;
    }

    // Create job
    super(scope, id, {
      name: `Publish ${id}`,
      runsOn: 'ubuntu-latest',
      steps: [{
        name: 'Publish',
        uses: 'docker/build-push-action@v1',
        with: dockerWith,
      }],
      ...overrides,
    });
  }
}
