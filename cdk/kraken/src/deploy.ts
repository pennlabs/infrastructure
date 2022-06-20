import { CheckoutJob, Workflow, JobProps, StepsProps } from "cdkactions";
import dedent from "ts-dedent";

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

  /**
   * Deploy to a specific feature branch.
   * @default false
   */
  deployToFeatureBranch?: boolean;
}

/**
 * A job to deploy an application using Kittyhawk.
 */
export class DeployJob extends CheckoutJob {
  /**
   *
   * @param scope cdkactions Workflow instance
   * @param config Optional configuration for the deploy job.
   * @param overrides Optional overrides for the job.
   */
  public constructor(
    scope: Workflow,
    config?: DeployJobProps,
    overrides?: Partial<JobProps>
  ) {
    // Build config
    const fullConfig: Required<DeployJobProps> = {
      deployTag: "${{ github.sha }}",
      defaultBranch: "master",
      deployToFeatureBranch: false,
      ...config,
    };

    const featureDeploySynthSteps: StepsProps[] = [
      {
        name: "Get Pull Request Number",
        id: "pr",
        run: dedent`
          echo "::set-output name=pull_request_number::$(gh pr view --json number -q .number || echo "")"
                  `,
        env: {
          GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
        },
      },
      {
        id: "synth",
        name: "Synth cdk8s manifests",
        if: "steps.pr.outputs.pull_request_number",
        run: dedent`cd k8s
          yarn install --frozen-lockfile
          
          # Get repo name (by removing owner/organization)
          export DEPLOY_TO_FEATURE_BRANCH=true
          export RELEASE_NAME=${"${REPOSITORY#*/}-pr-${{ steps.pr.outputs.pull_request_number }}"}

          # Export RELEASE_NAME as an output
          echo "::set-output name=RELEASE_NAME::$RELEASE_NAME"

          yarn build`,
        env: {
          GIT_SHA: fullConfig.deployTag,
          REPOSITORY: "${{ github.repository }}",
          AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}",
        },
      },
    ];

    const prodDeploySynthSteps: StepsProps[] = [
      {
        id: "synth",
        name: "Synth cdk8s manifests",
        run: dedent`cd k8s
          yarn install --frozen-lockfile
          
          # Get repo name (by removing owner/organization)
          export RELEASE_NAME=${"${REPOSITORY#*/}"}

          # Export RELEASE_NAME as an output
          echo "::set-output name=RELEASE_NAME::$RELEASE_NAME"

          yarn build`,
        env: {
          GIT_SHA: fullConfig.deployTag,
          REPOSITORY: "${{ github.repository }}",
          AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}",
        },
      },
    ];

    super(
      scope,
      fullConfig.deployToFeatureBranch ? "feature-branch-deploy" : "deploy",
      {
        runsOn: "ubuntu-latest",
        if: fullConfig.deployToFeatureBranch
          ? `startsWith(github.ref, 'refs/heads/feat/') == true`
          : `github.ref == 'refs/heads/${fullConfig.defaultBranch}'`,
        steps: [
          ...(fullConfig.deployToFeatureBranch
            ? featureDeploySynthSteps
            : prodDeploySynthSteps),
          {
            name: "Deploy",
            if: "steps.synth.outcome == 'success'",
            run: dedent`aws eks --region us-east-1 update-kubeconfig --name production --role-arn arn:aws:iam::${"${AWS_ACCOUNT_ID}"}:role/kubectl

            # Get repo name from synth step
            RELEASE_NAME=${"${{ steps.synth.outputs.RELEASE_NAME }}"}

            # Deploy
            kubectl apply -f k8s/dist/ -l app.kubernetes.io/component=certificate
            kubectl apply -f k8s/dist/ --prune -l app.kubernetes.io/part-of=$RELEASE_NAME`,
            env: {
              AWS_ACCOUNT_ID: "${{ secrets.AWS_ACCOUNT_ID }}",
              AWS_ACCESS_KEY_ID: "${{ secrets.GH_AWS_ACCESS_KEY_ID }}",
              AWS_SECRET_ACCESS_KEY: "${{ secrets.GH_AWS_SECRET_ACCESS_KEY }}",
            },
          },
        ],
        ...overrides,
      }
    );
  }
}
