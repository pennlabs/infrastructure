import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
import * as dedent from 'dedent-js';

/**
 * Optional props to configure the React check job.
 */
export interface ReactCheckProps {
  /**
   * Node version to test the project with.
   * @default "14"
   */
  nodeVersion?: string;

  /**
   * Location of the React project within the repo
   * @default "."
   */
  projectLocation?: string;
}

/**
 * A job to test a React project and upload code coverage.
 */
export class ReactCheck extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param config Optional configuration for the React check job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(scope: Workflow, config?: ReactCheckProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<ReactCheckProps> = {
      nodeVersion: '14',
      projectLocation: '.',
      ...config,
    };


    // Create Job
    super(scope, 'react-check', {
      name: 'React Check',
      runsOn: 'ubuntu-latest',
      steps: [{
        name: 'Cache',
        uses: 'actions/cache@v2',
        with: {
          path: '**/node_modules',
          key: `v0-\${{ hashFiles('${fullConfig.projectLocation}/yarn.lock') }}`,
        },
      },
      {
        name: 'Install Dependencies',
        run: dedent`cd ${fullConfig.projectLocation}
        yarn install --frozen-lockfile`,
      },
      {
        name: 'Test',
        run: dedent`cd ${fullConfig.projectLocation}
        yarn test`,
      },
      {
        name: 'Upload Code Coverage',
        run: dedent`ROOT=$(pwd)
        cd ${fullConfig.projectLocation}
        yarn run codecov -p $ROOT -F frontend`,
      }],
      container: {
        image: `node:${fullConfig.nodeVersion}`,
      },
      ...overrides,
    });
  }
}
