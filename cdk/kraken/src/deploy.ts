import { CheckoutJob, Workflow, JobProps } from 'cdkactions';
import * as dedent from 'dedent-js';

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

    // Create job
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
          },
        },
        {
          name: 'Deploy',
          run: dedent`aws eks --region us-east-1 update-kubeconfig --name production --role-arn arn:aws:iam::\${AWS_ACCOUNT_ID}:role/kubectl

          # get repo name from synth step
          RELEASE_NAME=\${{ steps.synth.outputs.RELEASE_NAME }}

          for i in {1..10}; do
            # This is bash soup, but it'll do.
            # 1. Attempt to install with kittyhawk
            # 2. If this succeeds, exit with a success status code
            # 3. If it fails, mark the command as succeeded so that '-e' doesn't kick us out
            # 4. Wait 10s and try again
            kubectl apply -f k8s/dist/kittyhawk.k8s.yaml --prune -l release=$RELEASE_NAME && exit 0 || true
            sleep 10s
            echo "Retrying deploy for $i times"
          done

          # If we get here, all kubectl applies failed so our command should fail
          exit 1`,
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
