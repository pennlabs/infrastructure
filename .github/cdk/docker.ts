import { CheckoutJob, Stack, Workflow } from "cdkactions";
import { DockerPublishJob } from "@pennlabs/kraken"
import { Construct } from "constructs";

export class DockerPublishStack extends Stack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const workflow = new Workflow(this, `docker-${name}`, {
      name: `Publish ${name}`,
      on: {
        push: {
          paths: [`docker/${name}/**`]
        }
      },
    });

    new DockerPublishJob(workflow, name, {
      imageName: name,
      path: `docker/${name}`,
    });
  }
}

/**
 * Custom Docker Publish Stack for Shibboleth that supports
 * loading an image tag from a file
 */
export class ShibbolethDockerStack extends Stack {
  constructor(scope: Construct) {
    super(scope, 'shibboleth');
    const name = 'shibboleth-sp-nginx';

    const workflow = new Workflow(this, `docker-${name}`, {
      name: `Publish ${name}`,
      on: {
        push: {
          paths: [`docker/${name}/**`]
        }
      },
    });

    const versionJob = new CheckoutJob(workflow, 'version', {
      runsOn: 'ubuntu-latest',
      steps: [
        {
          id: 'version',
          name: 'Set version',
          run: `echo "::set-output name=version::\$(cat docker/${name}/VERSION.txt)"`
        }
      ],
      outputs: {
        version: '${{ steps.version.outputs.version }}'
      }
    })
    new DockerPublishJob(workflow, name,
      {
        imageName: name,
        path: `docker/${name}`,
        tags: `latest,\${{ needs.${versionJob.id}.outputs.version }}`,
      },
      {
        needs: versionJob.id,
      }
    );
  }
}
