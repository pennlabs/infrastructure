import { CheckoutJob, Workflow, Stack, WorkflowProps } from 'cdkactions';
import { Construct } from 'constructs';

/**
 * Optional props to configure the PyPI publish stack.
 */
export interface PyPIPublishStackProps {
  /**
   * Python version to build the package with.
   * @default "3.8"
   */
  pythonVersion?: string;

  /**
   * List of python versions to run tox with.
   * @default 3.6, 3.7, 3.8, 3.9
   */
  pythonMatrixVersions?: number[];
}

/**
 * A stack to test a PyPI package on all branches as well as publish the package when
 * a commit has a semver tag.
 */
export class PyPIPublishStack extends Stack {
  /**
   *
   * @param scope cdkactions App instance.
   * @param config Optional configuration for the stack.
   * @param overrides Optional overrides for the workflow.
   */
  public constructor(scope: Construct, config?: PyPIPublishStackProps, overrides?: Partial<WorkflowProps>) {
    // Build config
    const fullConfig: Required<PyPIPublishStackProps> = {
      pythonVersion: '3.8',
      pythonMatrixVersions: [3.6, 3.7, 3.8, 3.9],
      ...config,
    };

    super(scope, 'pypi');
    const workflow = new Workflow(this, 'build-and-publish', {
      name: 'Build and Publish',
      on: {
        push: {
          branches: ['**'],
          tags: ['[0-9]+.[0-9]+.[0-9]+'],
        },
      },
      ...overrides,
    });
    const testJob = new CheckoutJob(workflow, 'test', {
      runsOn: 'ubuntu-latest',
      strategy: {
        matrix: {
          'python-version': fullConfig.pythonMatrixVersions,
        },
      },
      steps: [
        {
          name: 'Set up Python ${{ matrix.python-version }}',
          uses: 'actions/setup-python@v2',
          with: {
            'python-version': '${{ matrix.python-version }}',
          },
        },
        {
          name: 'Install dependencies',
          run: 'pip install tox tox-gh-actions codecov',
        },
        {
          name: 'Test',
          run: 'tox',
        },
        {
          name: 'Upload Code Coverage',
          run: 'codecov',
        },
      ],
    });

    new CheckoutJob(workflow, 'publish', {
      runsOn: 'ubuntu-latest',
      container: {
        image: `python:${fullConfig.pythonVersion}`,
      },
      needs: testJob.id,
      if: "startsWith(github.ref, 'refs/tags')",
      steps: [
        {
          name: 'Verify tag',
          run: 'python3 setup.py verify',
        },
        {
          name: 'Build',
          run: 'python3 setup.py sdist bdist_wheel',
        },
        {
          name: 'Publish',
          uses: 'pypa/gh-action-pypi-publish@v1',
          with: {
            user: '__token__',
            password: '${{ secrets.PYPI_PASSWORD }}',
          },
        },
      ],
    });
  }
}
