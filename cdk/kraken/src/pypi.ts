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
    new CheckoutJob(workflow, 'test', {
      runsOn: 'ubuntu-latest',
      container: {
        image: 'themattrix/tox',
      },
      steps: [
        {
          name: 'Install dependencies',
          run: 'pip install codecov',
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
