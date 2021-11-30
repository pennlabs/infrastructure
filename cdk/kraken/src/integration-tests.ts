import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
import dedent from 'ts-dedent';
import { PostIntegrationPublishJob } from './postintegrationimagepublishjob';
import { buildId, buildName } from './utils';


/**
 * Optional props to configure the IntegrationTestsJob.
 */
export interface IntegrationTestsJobProps {
  /**
   * A custom id to append onto job name and ids. Useful when using
   * multiple instances of IntegrationTestsJob in a single workflow.
   * @default no suffix
   */
  id?: string;

  /**
   * A (list of) docker-compose commands to run integration tests.
   */
  testCommand: string;

  /**
   * A list of job IDs that built docker images.
   */
  dockerBuildIds: string[];

  /**
   * A list of the docker images to publish.
   */
  dockerImages: string[];

  /**
   * Create a post integration docker publish job.
   * @default true
   */
  createPostIntegrationPublishJob?: boolean;
}

/**
 * Creates a Job that utilizes a docker-compose file to run integration
 * tests.
 *
 * This job assumes a docker-compose file exists named `docker-compose.test.yaml` in
 * the root of the repo as well as a django service called `backend`.
 */
export class IntegrationTestsJob extends CheckoutJob {
  /**
   * ID of the final job (either this job, or the post integration publish job).
   */
  public readonly finalJobId: string;

  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param config Configuration for the integration tests.
   * @param overrides Optional Overrides for the job.
   */
  public constructor(scope: Workflow, config: IntegrationTestsJobProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<IntegrationTestsJobProps> = {
      id: '',
      createPostIntegrationPublishJob: true,
      ...config,
    };

    // Create Job
    super(scope, buildId('integration-tests', fullConfig.id), {
      name: buildName('Integration Tests', fullConfig.id),
      runsOn: 'ubuntu-latest',
      steps: [
        {
          uses: 'actions/download-artifact@v2',
        },
        {
          name: 'Load docker images',
          run: fullConfig.dockerBuildIds.map(id => `docker load --input ${id}/image.tar`).join('\n'),
        },
        {
          name: 'Run docker compose',
          run: dedent`mkdir -p /tmp/test-results
          docker-compose -f docker-compose.test.yaml up -d`,
        },
        {
          name: 'Wait for backend',
          run: dedent`for try in {1..20}; do
            docker-compose -f docker-compose.test.yaml exec -T backend python manage.py migrate --check && break
            sleep 5
          done`,
        },
        {
          name: 'Populate backend',
          run: 'docker-compose -f docker-compose.test.yaml exec -T backend python manage.py populate',
        },
        {
          name: 'Run integration tests',
          run: fullConfig.testCommand,
        },
        {
          name: 'Delete artifacts when no longer needed',
          if: "failure() || github.ref != 'refs/heads/master'",
          uses: 'geekyeggo/delete-artifact@v1',
          with: {
            name: fullConfig.dockerBuildIds.join('\n'),
          },
        },
        {
          name: 'Print logs on failure',
          if: 'failure()',
          run: 'docker-compose -f docker-compose.test.yaml logs',
        },
        {
          name: 'Upload artifacts on failure',
          if: 'failure()',
          uses: 'actions/upload-artifact@v2',
          with: {
            name: 'cypress-output',
            path: '/tmp/test-results',
          },
        },
      ],
      env: {
        GIT_SHA: '${{ github.sha }}',
      },
      ...overrides,
    });

    // Set public fields
    this.finalJobId = fullConfig.id;

    // Optionally create post integration publish job function
    if (fullConfig.createPostIntegrationPublishJob) {
      const postIntegrationPublishJob = new PostIntegrationPublishJob(scope,
        {
          dockerBuildIds: fullConfig.dockerBuildIds,
          dockerImages: fullConfig.dockerImages,
        },
        {
          needs: this.id,
        });
      this.finalJobId = postIntegrationPublishJob.id;
    }
  }
}
