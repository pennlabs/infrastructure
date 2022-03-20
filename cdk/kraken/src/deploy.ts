import { CheckoutJob, Workflow, JobProps } from 'cdkactions';
import dedent from 'ts-dedent';

/**
 * Optional props to configure the deploy job.
 */
export interface DeployJobProps {
  /**
   * Deploy tag to set in kittyhawk.
   * @default current git sha
   */
  deployTag?: string;

  /**
   * Branch to limit deploys to.
   * @default master
   */
  defaultBranch?: string;
}

/**
 * A job to deploy an application using Kittyhawk.
 */
export class DeployJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance
   * @param config Optional configuration for the deploy job.
   * @param overrides Optinoal overrides for the job.
   */
  public constructor(scope: Workflow, config?: DeployJobProps, overrides?: Partial<JobProps>) {
    // Build config
    const fullConfig: Required<DeployJobProps> = {
      deployTag: '${{ github.sha }}',
      defaultBranch: 'master',
      ...config,
    };

    super(scope, 'deploy', {
      runsOn: 'ubuntu-latest',
      if: `github.ref == 'refs/heads/${fullConfig.defaultBranch}'`,
      steps: [
        {
          id: 'synth',
          name: 'Synth cdk8s manifests',
          run: dedent`cd k8s
          yarn install

          # get repo name (by removing owner/organization)
          RELEASE_NAME=\${REPOSITORY#*/}

          # Export RELEASE_NAME as an output
          echo "::set-output RELEASE_NAME=$RELEASE_NAME"

          yarn build`,
          env: {
            GIT_SHA: fullConfig.deployTag,
            REPOSITORY: '${{ github.repository }}',
            AWS_ACCOUNT_ID: '${{ secrets.AWS_ACCOUNT_ID }}',
          },
        },
        {
          name: 'Deploy',
          run: dedent`aws eks --region us-east-1 update-kubeconfig --name production --role-arn arn:aws:iam::\${AWS_ACCOUNT_ID}:role/kubectl

          # get repo name from synth step
          RELEASE_NAME=\${{ steps.synth.outputs.RELEASE_NAME }}

          # Deploy
          # TODO: figure out labels/deploy command
          kubectl apply -f k8s/dist/ --prune -l app.kubernetes.io/part-of=$RELEASE_NAME`,
          env: {
            AWS_ACCOUNT_ID: '${{ secrets.AWS_ACCOUNT_ID }}',
            AWS_ACCESS_KEY_ID: '${{ secrets.GH_AWS_ACCESS_KEY_ID }}',
            AWS_SECRET_ACCESS_KEY: '${{ secrets.GH_AWS_SECRET_ACCESS_KEY }}',
          },
        },
      ],
      ...overrides,
    });
  }
}
