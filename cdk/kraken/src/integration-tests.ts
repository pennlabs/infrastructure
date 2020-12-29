import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
import { buildId, buildName } from './utils';


export interface IntegrationTestsJobProps {
  id?: string;
}

// TODO: finish this
export class IntegrationTestsJob extends CheckoutJob {
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
