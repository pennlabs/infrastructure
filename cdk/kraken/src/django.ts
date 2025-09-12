import { CheckoutJob, Workflow, StepsProps, JobProps } from "cdkactions";
import dedent from "ts-dedent";
import { buildId, buildName } from "./utils";

/**
 * Props to configure the Django check job.
 */
export interface DjangoCheckJobProps {
  /**
   * A custom id to append onto job name and ids. Useful when using
   * multiple instances of DjangoCheckJob in a single workflow.
   * @default no suffix
   */
  id?: string;

  /**
   * Python version to test the project with.
   * @default "3.10-bookworm"
   */
  pythonVersion?: string;

  /**
   * Location of the Django project within the repo.
   * @default "."
   */
  path?: string;

  /**
   * Name of the Django project to test.
   */
  projectName: string;

  /**
   * Check the project with black?
   * @default true
   */
  black?: boolean;

  /**
   * Check the project with flake8?
   * @default true
   */
  flake8?: boolean;
}

/**
 * A job to lint and test a Django project as well as upload code coverage.
 *
 * Note that tests are run in parallel to reduce testing time.
 */
export class DjangoCheckJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance.
   * @param config Configuration for the Django check job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(
    scope: Workflow,
    config: DjangoCheckJobProps,
    overrides?: Partial<JobProps>
  ) {
    // Build config
    const fullConfig: Required<DjangoCheckJobProps> = {
      id: "",
      pythonVersion: "3.10-bookworm",
      path: ".",
      black: true,
      flake8: true,
      ...config,
    };

    // Define steps
    const steps: StepsProps[] = [
      {
        name: "Cache",
        uses: "actions/cache@v4",
        with: {
          path: "~/.local/share/virtualenvs",
          key: `v0-\${{ hashFiles('${fullConfig.path}/Pipfile.lock') }}`,
        },
      },
      {
        name: "Install Dependencies",
        run: dedent`cd ${fullConfig.path}
      pip install pipenv
      pipenv install --deploy --dev`,
      },
    ];
    if (fullConfig.flake8) {
      steps.push({
        name: "Lint (flake8)",
        run: dedent`cd ${fullConfig.path}
        pipenv run flake8 .`,
      });
    }
    if (fullConfig.black) {
      steps.push({
        name: "Lint (black)",
        run: dedent`cd ${fullConfig.path}
        pipenv run black --check .`,
      });
    }
    steps.push({
      name: "Test (run in parallel)",
      run: dedent`cd ${fullConfig.path}
      pipenv run coverage run --concurrency=multiprocessing manage.py test --settings=${fullConfig.projectName}.settings.ci --parallel
      pipenv run coverage combine
      pipenv run coverage xml`,
    });
    steps.push({
      name: "Upload Code Coverage",
      uses: "codecov/codecov-action@v3",
      with: {
        token: "${{ secrets.CODECOV_TOKEN }}",
        directory: "./backend/",
        fail_ci_if_error: true,
        files: "coverage.xml",
        name: "codecov-umbrella",
        verbose: true,
      },
    });

    // Create Job
    super(scope, buildId("django-check", fullConfig.id), {
      name: buildName("Django Check", fullConfig.id),
      runsOn: "ubuntu-latest",
      steps,
      container: {
        image: `python:${fullConfig.pythonVersion}`,
      },
      env: {
        DATABASE_URL: "postgres://postgres:postgres@postgres:5432/postgres",
      },
      services: {
        postgres: {
          image: "postgres:12",
          env: {
            POSTGRES_USER: "postgres",
            POSTGRES_DB: "postgres",
            POSTGRES_PASSWORD: "postgres",
          },
          options:
            "--health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5",
        },
      },
      ...overrides,
    });
  }
}
