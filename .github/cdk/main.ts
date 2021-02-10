import { App, Job, Stack, Workflow } from "cdkactions";
import { CDKPublishStack } from "@pennlabs/kraken"
import { Construct } from "constructs";

export class AutoApproveStack extends Stack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const workflow = new Workflow(this, 'approve', {
      name: 'Auto Approve dependabot PRs',
      on: 'pullRequest',
    });

    new Job(workflow, 'approve', {
      runsOn: 'ubuntu-latest',
      steps: [
        {
          uses: 'hmarr/auto-approve-action@v2.0.0',
          if: "github.actor == 'dependabot[bot]'",
          with: {
            "github-token": "${{ secrets.BOT_GITHUB_PAT }}"
          }
        }
      ],
    });
  }
}

const app = new App();
new CDKPublishStack(app, 'kraken');
new CDKPublishStack(app, 'kittyhawk');
new AutoApproveStack(app, 'approve');
app.synth();
