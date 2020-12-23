import { CheckoutJob, Workflow, Stack, WorkflowProps } from 'cdkactions';
import { Construct } from 'constructs';
import * as dedent from 'dedent-js';

export interface CDKPublishProps {
  defaultBranch?: string;
  nodeVersion?: string;
}

export class CDKStack extends Stack {
  public constructor(scope: Construct, id: string, config?: CDKPublishProps, overrides?: Partial<WorkflowProps>) {
    // Build config
    const fullConfig: Required<CDKPublishProps> = {
      defaultBranch: 'master',
      nodeVersion: '14',
      ...config,
    };
    super(scope, id);
    const workflow = new Workflow(this, id, {
      name: `Publish ${id}`,
      on: {
        push: {
          paths: [`${id}/**`],
        },
      },
      ...overrides,
    });
    new CheckoutJob(workflow, 'publish', {
      runsOn: 'ubuntu-latest',
      steps: [{
        name: 'Cache',
        uses: 'actions/cache@v2',
        with: {
          path: '**/node_modules',
          // TODO: fix extra quotes here
          key: `v0-\${{ hashFiles('${id}/yarn.lock') }}`,
        },
      },
      {
        name: 'Install Dependencies',
        run: dedent`cd ${id}
        yarn install --frozen-lockfile`,
      },
      {
        name: 'Test',
        run: dedent`cd ${id}
        yarn test`,
      },
      {
        name: 'Upload Code Coverage',
        run: dedent`ROOT=$(pwd)
        cd ${id}
        yarn run codecov -p $ROOT -F ${id}`,
      },
      {
        name: 'Publish to npm',
        run: dedent`cd ${id}
        npm login --always-auth
        npm publish --access public`,
        if: `github.ref == 'refs/heads/${fullConfig.defaultBranch}'`,
      }],
      // TODO: publish docs
      container: {
        image: `node:${fullConfig.nodeVersion}`,
      },
    });
  }
}
