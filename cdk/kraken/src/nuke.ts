import { CheckoutJob, Workflow, JobProps } from "cdkactions";
import dedent from "ts-dedent";

/**
 * Optional props to configure the nuke job.
 */
export interface NukeJobProps {
  /**
   * Deploy tag to set in kittyhawk.
   * @default current git sha
   */
  deployTag?: string;
}

/**
 * A job to undeploy/nuke a product.
 * When we nuke, it should ALWAYS be for feature branch deployment, not production.
 */
export class NukeJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance
   * @param config Optional configuration for the deploy job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(
    scope: Workflow,
    config?: NukeJobProps,
    overrides?: Partial<JobProps>
  ) {
    // Nuke config
    const fullConfig: Required<NukeJobProps> = {
      deployTag: "${{ github.sha }}",
      ...config,
    };

    super(scope, "nuke", {
      runsOn: "ubuntu-latest",
      if: `startsWith(github.ref, 'refs/heads/feat/') == true`, // Nuke only for feature branches
      steps: [
        {
          id: "synth",
          name: "Synth cdk8s manifests",
          run: dedent`cd k8s
          yarn install --frozen-lockfile
          
          # Feature Branch nuke set-up
          export DEPLOY_TO_FEATURE_BRANCH=true
          export RELEASE_NAME=${"${REPOSITORY#*/}"}-pr-$PR_NUMBER
          
          # Export RELEASE_NAME as an output
          echo "::set-output name=RELEASE_NAME::$RELEASE_NAME"

          yarn build`,
          env: {
            PR_NUMBER: "${{ github.event.pull_request.number }}",
            GIT_REF: "${{ github.ref }}",
            GIT_SHA: fullConfig.deployTag,
            REPOSITORY: "${{ github.repository }}",
            AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}",
          },
        },
        {
          name: "Nuke",
          run: dedent`aws eks --region us-east-1 update-kubeconfig --name production --role-arn arn:aws:iam::${"${AWS_ACCOUNT_ID}"}:role/kubectl

          # Get repo name from synth step
          RELEASE_NAME=${"${{ steps.synth.outputs.RELEASE_NAME }}"}

          # Delete all non-certificate resources
          kubectl delete -f k8s/dist/ -l app.kubernetes.io/part-of=$RELEASE_NAME
          `,
          env: {
            AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}",
            AWS_ACCESS_KEY_ID: "${{ secrets.GH_AWS_ACCESS_KEY_ID }}",
            AWS_SECRET_ACCESS_KEY: "${{ secrets.GH_AWS_SECRET_ACCESS_KEY }}",
          },
        },
      ],
      ...overrides,
    });
  }
}
