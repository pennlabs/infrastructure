# Kittyhawk

Kittyhawk is the automated Kubernetes YAML generator for Penn Labs. 
With Kittyhawk, you can define an application's deployment configuration in Typescript using objects called [constructs](https://cdk8s.io/docs/v1.0.0-beta.3/concepts/constructs/).

# Getting Started

The easiest way to get started with a Kittyhawk project is by following the following steps or by copying one of our existing products. At the end of this README, you can also see a simple example typescript file using Kittyhawk.

## 1. Set-up CDK8s Typescript Project
Create a `k8s` folder in your project. Within that folder, create a `cdk` folder. 

Within the `cdk` folder, initialize a `cdk8s` typescript project. You can do that by following the official cdk8s instructions [here](https://cdk8s.io/docs/latest/getting-started/#new-project). 

## 2. Add Kittyhawk
Import the kittyhawk library from `yarn` or `npm` and start writing your deployment configuration in Typescript.

On the very top level, set up your `main.ts` file in the following format using the `PennLabsChart`. 

```
export class MyChart extends PennLabsChart {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}
```

Within your chart, you can add various applications, cronjobs, and other configurations, including the following custom constructs:
- `ReactApplication`
- `DjangoApplication`
- `CronJob`
- `Redis`

## 3. Incorporate Kittyhawk into CI
### How yaml generation works
Kittyhawk can generate the yaml file for you. In order to do so, you must `cd` into the `k8s/cdk` directory. Then, you can generate the yaml by running `yarn compile && yarn synth`. The generated yaml file would appear in the `dist` folder (`RELEASE_NAME.k8s.yaml`). 

> For yaml generation to work properly, it's required to specify the following environment variables:
> - RELEASE_NAME: the name of the application being deploy (set to name of repository)
> - GIT_SHA: the sha of the latest commit

However, you should not be generating yaml manually and adding the generated yaml to the repository. Instead, it's important to add it to the github actions or the CI you have already built.
### Adding Kittyhawk to the CI
The deploy job in Kraken would handle the yaml file generation.

## Example
The [kittyhawk-demo repository](https://github.com/joyliu-q/kittyhawk-demos) contains examples of current Penn labs product co application deployed with Kittyhawk, along with their generated yaml. Finally, the `test/integration/` directory contains many examples of current Penn Labs product configurations written with Kittyhawk.

A sample `main.ts` file is structured like the following, covering the common use cases for Penn Labs products:

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