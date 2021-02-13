import { CheckoutJob, Workflow, JobProps } from 'cdkactions';
import * as dedent from 'dedent-js';

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
      image: 'pennlabs/helm-tools:c964e53d3e3e88d36677e84f5437da40a289c7a4',
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
        run: dedent`# default options to make sure failures stop script execution
        set -euo pipefail

        curl -s -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $DO_AUTH_TOKEN" "https://api.digitalocean.com/v2/kubernetes/clusters/\${K8S_CLUSTER_ID}/kubeconfig" > /kubeconfig.conf

        export KUBECONFIG=/kubeconfig.conf

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
          # 2. If this suceeds, exit with a success status code
          # 3. If it fails, mark the command as suceeded so that `-e` doesn't kick us out
          # 4. Wait 10s and try again
          helm upgrade --install --atomic --set=image_tag=$IMAGE_TAG -f k8s/values.yaml --version "\${DEPLOY_TAG}" $RELEASE_NAME pennlabs/icarus && exit 0 || true
          sleep 10s
          echo "Retrying deploy for $i times"
        done

        # If we get here, all helm installs failed so our command should fail
        exit 1`,
        env: {
          IMAGE_TAG: fullConfig.deployTag,
          DO_AUTH_TOKEN: '${{ secrets.DO_AUTH_TOKEN }}',
          K8S_CLUSTER_ID: '${{ secrets.K8S_CLUSTER_ID }}',
          REPOSITORY: '${{ github.repository }}',
        },
      }],
      ...overrides,
    });
  }
}
