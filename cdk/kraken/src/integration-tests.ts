import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
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
}

/**
 * Creates a Job that utilizes a docker-compose file to run integration
 * tests.
 * TODO: not finished
 */
export class IntegrationTestsJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param config Configuration for the integration tests.
   * @param overrides Optional Overrides for the job.
   */
  public constructor(scope: Workflow, config?: IntegrationTestsJobProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<IntegrationTestsJobProps> = {
      id: '',
      ...config,
    };

    // Create Job
    super(scope, buildId('integration-tests', fullConfig.id), {
      name: buildName('Integration Tests', fullConfig.id),
      runsOn: 'ubuntu-latest',
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
      ...overrides,
    });
  }
}
