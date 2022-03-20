import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
import dedent from 'ts-dedent';
import { buildId, buildName } from './utils';

/**
 * Optional props to configure the React check job.
 */
export interface ReactCheckJobProps {
  /**
   * A custom id to append onto job name and ids. Useful when using
   * multiple instances of ReactCheckJob in a single workflow.
   * @default no suffix
   */
  id?: string;

  /**
   * Node version to test the project with.
   * @default "14"
   */
  nodeVersion?: string;

  /**
   * Location of the React project within the repo
   * @default "."
   */
  path?: string;
}

/**
 * A job to lint and test a React project as well as upload code coverage.
 */
export class ReactCheckJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param config Optional configuration for the React check job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(scope: Workflow, config?: ReactCheckJobProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<ReactCheckJobProps> = {
      id: '',
      nodeVersion: '14',
      path: '.',
      ...config,
    };


    // Create Job
    super(scope, buildId('react-check', fullConfig.id), {
      name: buildName('React Check', fullConfig.id),
      runsOn: 'ubuntu-latest',
      steps: [{
        name: 'Cache',
        uses: 'actions/cache@v2',
        with: {
          path: '**/node_modules',
          key: `v0-\${{ hashFiles('${fullConfig.path}/yarn.lock') }}`,
        },
      },
      {
        name: 'Install Dependencies',
        run: dedent`cd ${fullConfig.path}
        yarn install --frozen-lockfile`,
      },
      {
        name: 'Lint',
        run: dedent`cd ${fullConfig.path}
        yarn lint`,
      },
      {
        name: 'Test',
        run: dedent`cd ${fullConfig.path}
        yarn test`,
      },
      {
        name: 'Upload Code Coverage',
        run: dedent`ROOT=$(pwd)
        cd ${fullConfig.path}
        yarn run codecov -p $ROOT -F frontend`,
      }],
      container: {
        image: `node:${fullConfig.nodeVersion}`,
      },
      ...overrides,
    });
  }
}
