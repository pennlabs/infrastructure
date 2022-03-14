# Kittyhawk

Kittyhawk is the automated Kubernetes YAML generator for Penn Labs. 
With Kittyhawk, you can define an application's deployment configuration in Typescript using objects called [constructs](https://cdk8s.io/docs/v1.0.0-beta.3/concepts/constructs/).

# Getting Started

The easiest way to get started with a Kittyhawk project is by following the following steps or by copying one of our existing products. At the end of this README, you can also see a simple example typescript file using Kittyhawk.

## 1. Set up CDK8s Typescript Project
Create a `k8s` folder within your project. Within that folder, create a `cdk` folder. 

Inside the `cdk` folder, initialize a `cdk8s` typescript project. You can do that by following the official cdk8s instructions [here](https://cdk8s.io/docs/latest/getting-started/#new-project). 

## 2. Add Kittyhawk
Import the kittyhawk library from `yarn` or `npm` and start writing your deployment configuration in Typescript.

At the very top level, add to your `main.ts` file in the following format using the `PennLabsChart`. 

```
export class MyChart extends PennLabsChart {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}
```

Within your chart, you can add various applications, cronjobs, and other configurations supported by kittyhawk, including the following custom constructs:
- `ReactApplication`
- `DjangoApplication`
- `CronJob`
- `Redis`

For more advanced custom constructs, please refer to our [documentation](TODO) (TODO: add link).

### Cron-time-generator
In many of our Penn Labs products, we use cronjobs to simplify our product tasks (e.g. loading courses, calculating office hours wait time).  

`cron-time-generator` ([npm link](https://www.npmjs.com/package/cron-time-generator)) is a package that allows for intuitive generation of cron job time expressions. 

It is not required to use this, but it is a developer dependency for kittyhawk and better practice: instead of specifying the time of a cronjob that runs every 5 minutes as `*/5 * * * *`, you can say `cronTime.every(5).minutes()`. 

For specifics of using `cron-time-generator`, refer to the documentation on npm or our code example at the bottom of this doc.

## 3. Incorporate Kittyhawk into CI
After the typescript constructs have been added and configured, the deployment yaml can be generated. 
### How yaml generation works (command line)
> **Note**: You should *NOT* be generating yaml manually and adding the generated yaml to the repository. Instead, it's important to add the yaml generation to the github actions or the CI you have already built. 

The following instructions are for *local testing purposes only* and if you want to understand what goes on under the hood.

To generate a yaml file, you must first change (`cd`) into the `k8s/cdk` directory. Then, you can generate the yaml by running `yarn compile && yarn synth`. The generated yaml file would appear in the `dist` folder (`RELEASE_NAME.k8s.yaml`). 

> For yaml generation to work properly, it's required to specify the following environment variables:
> - `RELEASE_NAME`: the name of the application being deploy (set to name of repository)
> - `GIT_SHA`: the sha of the latest commit

### Adding Kittyhawk to the CI
The deploy job (`DeployJob`) in [Kraken](https://github.com/pennlabs/infrastructure/tree/master/cdk/kraken) would handle the yaml file generation process. For more information, see the kraken

## Example
The [kittyhawk-demo repository](https://github.com/joyliu-q/kittyhawk-demos) contains examples of current Penn labs product application deployed with Kittyhawk, along with their generated yaml.

A sample `main.ts` file is included below, covering the more common use cases for Penn Labs products:

```
import { Construct } from 'constructs';
import { PennLabsChart, ReactApplication, DjangoApplication, RedisApplication, CronJob } from '@pennlabs/kittyhawk';

const cronTime = require('cron-time-generator');

export class ExampleChart extends PennLabsChart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const backendImage = 'pennlabs/example-backend';
    const frontendImage = 'pennlabs/examplefrontend';

    const secret = 'secret';
    const domain = 'domain';

    new RedisApplication(this, 'redis', {});

    new DjangoApplication(this, 'django-asgi', {
      deployment: {
        image: backendImage,
        cmd: ['/usr/local/bin/asgi-run'],
        replicas: 2,
        secret: secret,
        env: [
          { name: 'REDIS_HOST', value: 'redis' },
        ],
      },
      djangoSettingsModule: 'example.settings.production',
      domains: [{ host: domain, paths: ['/api/ws'] }],
    });

    new ReactApplication(this, 'react', {
      deployment: {
        image: frontendImage,
        replicas: 2,
      },
      domain: { host: domain, paths: ['/'] },
      portEnv: '80',
    });

    /** Cronjobs **/
    new CronJob(this, 'example-cronjob', {
      schedule: cronTime.everyDayAt(8),
      image: backendImage,
      secret: secret,
      cmd: ['your', 'command'],
    });
  }
}
```