import { Workflow, JobProps, CheckoutJob } from 'cdkactions';
import * as dedent from 'dedent-js';

export interface ReactCheckProps {
  nodeVersion?: string;
  projectLocation?: string;
}

export class ReactCheck extends CheckoutJob {
  public constructor(scope: Workflow, config: ReactCheckProps, overrides?: Partial<JobProps>) {
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
