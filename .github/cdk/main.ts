import { App, CheckoutJob, Stack, Workflow } from "cdkactions";
import { CDKPublishStack } from "@pennlabs/kraken"
import { Construct } from "constructs";

class TerraformLintStack extends Stack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const workflow = new Workflow(this, 'terraform', {
      name: 'Lint terraform files',
      on: {
        push: {
          paths: ['terraform/**.tf']
        }
      },
    });

    new CheckoutJob(workflow, 'lint', {
      runsOn: 'ubuntu-latest',
      steps: [
        {
          uses: 'hashicorp/setup-terraform@v1'
        },
        {
          run: 'terraform fmt -check -recursive terraform'
        }
      ],
    });
  }
}

const app = new App();
new CDKPublishStack(app, 'kraken');
new CDKPublishStack(app, 'kittyhawk');
new TerraformLintStack(app, 'terraform');
app.synth();
