import { Workflow, Stack, WorkflowProps, Job } from "cdkactions";
import { Construct } from "constructs";

/**
 * Auto-approve PRs opened by dependabot. Used to fulfil requirements
 * needed to automatically merge using mergify
 */
export class AutoApproveStack extends Stack {
  /**
   *
   * @param scope cdkactions App instance.
   * @param overrides Optional overrides for the stack.
   */
  public constructor(scope: Construct, overrides?: Partial<WorkflowProps>) {
    super(scope, "autoapprove");
    const workflow = new Workflow(this, "autoapprove", {
      name: "Auto Approve dependabot PRs",
      on: "pullRequest",
      ...overrides,
    });

    new Job(workflow, "approve", {
      runsOn: "ubuntu-latest",
      steps: [
        {
          uses: "hmarr/auto-approve-action@v2.0.0",
          if: "github.actor == 'dependabot[bot]'",
          with: {
            "github-token": "${{ secrets.BOT_GITHUB_PAT }}",
          },
        },
      ],
    });
  }
}
