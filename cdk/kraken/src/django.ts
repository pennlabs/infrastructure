import { CheckoutJob, Workflow, StepsProps, JobProps } from 'cdkactions';
import * as dedent from 'dedent-js';

export interface DjangoCheckProps {
  pythonVersion?: string;
  projectLocation?: string;
  projectName: string;
  black?: boolean;
  flake8?: boolean;
}

export class DjangoCheck extends CheckoutJob {
  public constructor(scope: Workflow, config: DjangoCheckProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<DjangoCheckProps> = {
      pythonVersion: '3.8',
      projectLocation: '.',
      black: true,
      flake8: true,
      ...config,
    };

    // Define steps
    const steps: StepsProps[] = [
      {
        name: 'Cache',
        uses: 'actions/cache@v2',
        with: {
          path: '~/.local/share/virtualenvs',
          key: `v0-\${{ hashFiles('${fullConfig.projectLocation}/Pipfile.lock') }}`,
        },
      },
      {
        name: 'Install Dependencies',
        run: dedent`cd ${fullConfig.projectLocation}
      pip install pipenv
      pipenv install --deploy --dev`,
      },
    ];
    if (fullConfig.flake8) {
      steps.push({
        name: 'Lint (flake8)',
        run: dedent`cd ${fullConfig.projectLocation}
        pipenv run flake8 .`,
      });
    }
    if (fullConfig.black) {
      steps.push({
        name: 'Lint (black)',
        run: dedent`cd ${fullConfig.projectLocation}
        pipenv run black --check .`,
      });
    }
    steps.push({
      name: 'Test',
      run: dedent`cd ${fullConfig.projectLocation}
      pipenv run coverage run manage.py test --settings=${fullConfig.projectName}.settings.ci --parallel`,
    });
    steps.push({
      name: 'Upload Code Coverage',
      run: dedent`ROOT=$(pwd)
      cd ${fullConfig.projectLocation}
      pipenv run codecov --root ROOT --flags backend`,
    });

    // Create Job
    super(scope, 'django-check', {
      name: 'Django Check',
      runsOn: 'ubuntu-latest',
      steps,
      container: {
        image: `python:${fullConfig.pythonVersion}`,
      },
      env: {
        DATABASE_URL: 'postgres://postgres:postgres@postgres:5432/postgres',
      },
      services: {
        postgres: {
          image: 'postgres:12',
          env: {
            POSTGRES_USER: 'postgres',
            POSTGRES_DB: 'postgres',
            POSTGRES_PASSWORD: 'postgres',
          },
          options: '--health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5',
        },
      },
      ...overrides,
    });
  }
}

