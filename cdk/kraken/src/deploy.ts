import { CheckoutJob, Workflow, JobProps } from 'cdkactions';
import dedent from 'ts-dedent';

/**
 * Optional props to configure the deploy job.
 */
export interface DeployJobProps {
  /**
   * Deploy tag to set in icarus.
   * @default current git sha
   */
  deployTag?: string;

  /**
   * Image to run the deploy job in.
   * @default pennlabs/helm-tools
   */
  image?: string;

  /**
   * Branch to limit deploys to.
   * @default master
   */
  defaultBranch?: string;
}

/**
 * A job to deploy an application using Icarus.
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
      image: 'pennlabs/helm-tools:39b60af248944898fcbc58d1fe5b0f1995420aef',
      defaultBranch: 'master',
      ...config,
    };

    // Create job
    super(scope, 'deploy', {
      runsOn: 'ubuntu-latest',
      container: {
        image: fullConfig.image,
      },
      if: `github.ref == 'refs/heads/${fullConfig.defaultBranch}'`,
      steps: [{
        name: 'Deploy',
        run: dedent`aws eks --region us-east-1 update-kubeconfig --name production --role-arn arn:aws:iam::\${AWS_ACCOUNT_ID}:role/kubectl

        # get repo name (by removing owner/organization)
        RELEASE_NAME=\${REPOSITORY#*/}

        # set git sha
        GIT_SHA=\${{ github.sha }}

        # Generate kittyhawk yaml files
        yarn compile && yarn synth

        # Delete all old resources that is associated with the repo
        kubectl apply -f k8s/dist/$RELEASE_NAME.k8s.yaml --prune -l repo=$RELEASE_NAME
        `,
        env: {
          IMAGE_TAG: fullConfig.deployTag,
          AWS_ACCOUNT_ID: '${{ secrets.AWS_ACCOUNT_ID }}',
          AWS_ACCESS_KEY_ID: '${{ secrets.GH_AWS_ACCESS_KEY_ID }}',
          AWS_SECRET_ACCESS_KEY: '${{ secrets.GH_AWS_SECRET_ACCESS_KEY }}',
          DO_AUTH_TOKEN: '${{ secrets.DO_AUTH_TOKEN }}',
          REPOSITORY: '${{ github.repository }}',
        },
      }],
      ...overrides,
    });
  }
}
