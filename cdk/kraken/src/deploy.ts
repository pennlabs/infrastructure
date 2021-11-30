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

        # this specifies what tag of icarus to pull down
        DEPLOY_TAG=$(yq r k8s/values.yaml deploy_version)
        if [ "$DEPLOY_TAG" = "null" ]; then
            echo "Could not find deploy tag"
            exit 1
        fi

        helm repo add pennlabs https://helm.pennlabs.org/
        for i in {1..10}; do
          # This is bash soup, but it'll do.
          # 1. Attempt to install with helm
          # 2. If this succeeds, exit with a success status code
          # 3. If it fails, mark the command as succeeded so that '-e' doesn't kick us out
          # 4. Wait 10s and try again
          helm upgrade --install --atomic --set=image_tag=$IMAGE_TAG -f k8s/values.yaml --version "\${DEPLOY_TAG}" $RELEASE_NAME pennlabs/icarus && exit 0 || true
          sleep 10s
          echo "Retrying deploy for $i times"
        done

        # If we get here, all helm installs failed so our command should fail
        exit 1`,
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
