import { CheckoutJob, Workflow, JobProps } from 'cdkactions';
import * as dedent from 'dedent-js';

export interface DeployJobProps {
  deployTag?: string;
  image?: string;
  defaultBranch?: string;
}

export class DeployJob extends CheckoutJob {
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
        run: dedent`curl -s -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $DO_AUTH_TOKEN" "https://api.digitalocean.com/v2/kubernetes/clusters/\${K8S_CLUSTER_ID}/kubeconfig" > /kubeconfig.conf
        
        export KUBECONFIG=/kubeconfig.conf
        
        # this specifies what tag of icarus to pull down
        DEPLOY_TAG=$(yq r k8s/values.yaml deploy_version)
        if [ "$DEPLOY_TAG" == "null" ]; then
            echo "Could not find deploy tag"
            exit 1
        fi
        
        helm repo add pennlabs https://helm.pennlabs.org/
        
        for i in {1..10}; do
          helm upgrade --install --atomic --set=image_tag=$IMAGE_TAG -f k8s/values.yaml --version "\${DEPLOY_TAG}" $RELEASE_NAME pennlabs/icarus && exit 0
          sleep 10s
          echo "Retrying deploy for $i times"
        done`,
        env: {
          IMAGE_TAG: fullConfig.deployTag,
          DO_AUTH_TOKEN: '${{ secrets.DO_AUTH_TOKEN }}',
          K8S_CLUSTER_ID: '${{ secrets.K8S_CLUSTER_ID }}',
        },
      }],
      ...overrides,
    });
  }
}
