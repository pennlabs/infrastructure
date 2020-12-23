import { CheckoutJob, Workflow, JobProps } from 'cdkactions';

export interface DockerPublishProps {
  imageName: string;
  path?: string;
  push?: string;
  tags?: string;
  username?: string;
  password?: string;
  cache?: boolean;
}

// TODO: look into docker build action v2
export class DockerPublish extends CheckoutJob {
  public constructor(scope: Workflow, id: string, config: DockerPublishProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<DockerPublishProps> = {
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
