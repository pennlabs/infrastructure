import { App, CheckoutJob, Stack, Workflow } from "cdkactions";
import { CDKPublishStack } from "@pennlabs/kraken"
import { Construct } from "constructs";
import { DockerPublishStack, ShibbolethDockerStack } from "./docker";

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

// CDK stacks
new CDKPublishStack(app, 'kraken');
new CDKPublishStack(app, 'kittyhawk');

// Docker stacks
const dockerImages = ['django-base', 'pg-s3-backup', 'team-sync'];
dockerImages.map(name => new DockerPublishStack(app, name));
new ShibbolethDockerStack(app);

// Misc stacks
new TerraformLintStack(app, 'terraform');
app.synth();
