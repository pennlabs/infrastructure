## Available Constructs

You can find the full API reference [here:](https://kittyhawk.pennlabs.org/) 

There are two main constructs, `Application` and `Cronjob`. `Application` has multiple subclasses, including `RedisApplication`, `ReactApplication` and `DjangoApplication`. There are also constructs for defining individual deployments, services, ingresses, etc. 

### Application

[Application](lib/application/base.d.ts) is the basic construct for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and a properties object containing a valid configuration. 
  - `ReactApplication` and `DjangoApplication` both subclass `Application`, and contain additional checks to make sure the configuration is correct. `RedisApplication` can be used to quickly configure Redis. 


### Properties for Application
You can find the full reference [here](https://kittyhawk.pennlabs.org/interfaces/application_base.ApplicationProps.html).

### Properties for ReactApplication and DjangoApplication
[DjangoApplication](lib/application/django.d.ts) and [ReactApplication](lib/application/react.d.ts) have special properties that override properties from Application.

Use these properties instead of defining an ingress, and the ingress will be auto-configured. Additionally, there is not need to set a `DOMAIN` environment variable (and `DJANGO_SETTINGS_MODULE` for `DjangoApplication`s), since it will automatically be set. 

You can also check out the full API reference for [DjangoApplication](https://kittyhawk.pennlabs.org/interfaces/application_django.DjangoApplicationProps.html) and [ReactApplication](https://kittyhawk.pennlabs.org/interfaces/application_react.ReactApplicationProps.html).

### Properties for RedisApplication

[RedisApplication](lib/application/redis.d.ts)([API reference](https://kittyhawk.pennlabs.org/interfaces/application_redis.RedisApplicationProps.html)) accepts the same properties as `Application`, however some default values are different.
- tag (`string`) - version tag to use for redis  (**Optional**, defaults to '6.0')
- port (`number`) - Port exposed by the application. (**Optional**, defaults to 6379)

Additionally, the image is set to 'redis'.

### Cronjob

[Cronjob](lib/cronjob.d.ts) is the construct for deploying a cronjob. To create an cronjob, it must be passed a scope, name and a properties object containing a valid configuration. 
### Properties for Cronjob
You can find the full reference [here](https://kittyhawk.pennlabs.org/interfaces/_cronjob_.cronjobprops.html). A summary of the properties is listed below:
- image (string) - Docker image to use. (**Required**)
- schedule (string) - The schedule to run the job at, in Cron format. Use the [cron-time-generator](https://www.npmjs.com/package/cron-time-generator) package to ensure that the cron schedule is written correctly.  (**Required**)
- restartPolicy (string) - [Policy](https://kubernetes.io/docs/concepts/workloads/controllers/job/#handling-pod-and-container-failures) for when the job should be restarted, either 'Always', 'OnFailure', or 'Never' (**Optional**, default 'Never')
- successLimit (number) - The number of successful finished jobs to retain. (**Optional**, default 1)
- failureLimit (number) - The number of failed jobs to retain. (**Optional**, default 1)

The following properties from Application are also available: ```tag, cmd, containerPort, extraEnv, port, pullPolicy, replicas, secret, secretMounts```


## Escape Hatches

Escape Hatches are an advanced feature that allow for constructs to be modified after they are synthesized. Instructions can be found [here](https://github.com/awslabs/cdk8s/blob/master/docs/concepts/escape-hatches.md).