## Available Constructs

You can find the full API reference [here:](https://pennlabs.github.io/kittyhawk/index.html) 

There are two main constructs, Application and Cronjob. Application has multiple subclasses, including  RedisApplication, ReactApplication and DjangoApplication. There are also constructs for defining individual deployments, services, ingresses, etc. 

### Application

[Application](lib/application.ts) is the basic construct for deploying a general application, containing a deployment, service, and optionally an ingress and certificate. To create an Application, it must be passed a scope, name and a properties object containing a valid configuration. 
  - ReactApplication and DjangoApplication both subclass Application, and contain additional checks to make sure the configuration is correct. RedisApplication can be used to quickly configure Redis. 


### Properties for Application
You can find the full reference [here](https://pennlabs.github.io/kittyhawk/interfaces/_lib_application_.applicationprops.html). A summary of the properties is listed below:
- image (string) - Docker image to use. (**Required**)
- tag (string) - tag to use for your image  (**Optional**, defaults to CircleCI SHA1, or "latest" if SHA1 is not set)
- port (number) - Port exposed by the application. (**Optional**, default 80)
- replicas (number) - Number of instances of your application to be run in the cluster (**Optional**, default 1)
- ingress (Array) - Array of hosts and corresponding paths to allow external users to access your application. (**Optional**, default undefined). Each entry should be in the form ```{ host: string, paths: string[] }```.  
  - host - The hostname to route this path (eg. 'penncourseplan.com'). (**Required**)
  - paths - A list of paths to use for this host. (**Required**)
- pullPolicy (string) - what type of [ImagePullPolicy](https://kubernetes.io/docs/concepts/containers/images/#updating-images) to use. One of "IfNotPresent", "Always", "Never". (**Optional**, default "IfNotPresent")
- cmd (Array\<string\>) - Command to override docker entrypoint. Provide a list of arguments for the command. (**Optional**, default undefined)
- containerPort (number) - the target port on the pod for the service to forward traffic to. (**Optional**, defualts to ```port```  if provided, and 80 otherwise)
- extraEnv (Array) - Array of extra environment variables to export. (**Optional**, default undefined).
  - Each environment variable should be in the form ```{ name: string, value: string }```, where ```name``` is the env var name, and ```value``` is the env var value.
- secret (string) - Secret from Vault to use for your application (**Optional**, default undefined)
- secretMounts (Array) - Array of secret volume mounts for the deployment container. (**Optional**, default undefined)
    - Each mount should be an object in the form ```{ mountPath: string; name: string; subPath: string }```.
      - name - name of secret (**Required**)
      - mountPath - Path within the container to mount the secret. (**Required**)
      - subPath (Required) - [sub-path](https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath) to mount the secret in the volume (**Required**)
- readinessProbe ([probeProps](https://pennlabs.github.io/kittyhawk/interfaces/_lib_container_.probeprops.html)) - A [readiness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) to start. (**Optional**, default undefined)
- livenessProbe ([probeProps](https://pennlabs.github.io/kittyhawk/interfaces/_lib_container_.probeprops.html)) - A [liveness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command) to start. (**Optional**, default undefined)
 - autoScalingProps ([AutoscalingProps](https://pennlabs.github.io/kittyhawk/interfaces/_lib_autoscaler_.autoscalingprops.html)) - Options to configure a Horizontal Pod Autoscaler ([HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)) based on CPU, memory, or request usage. (**Optional**, default undefined)

### Properties for ReactApplication and DjangoApplication
DjangoApplication and ReactApplication have special properties that override properties from Application.

For DjangoApplication:
- domain (string) - Domain for the application. (**Required**)
- ingressPaths (Array\<String\>) - List of paths that should be available on the domain. (**Required**)
- djangoSettingsModule (string) - DJANGO_SETTINGS_MODULE environment variable. (**Required**)

For ReactApplication:
- domain (string) - Domain for the application. (**Required**)
- ingressPaths (Array\<String\>) - List of paths that should be available on the domain. (**Required**)
- portEnv (string) - PORT environment variable. (**Optional**, default '80')

Use these properties instead of defining an ingress, and the ingress will be auto-configured. Additionally, do not set a DOMAIN environment variable in extraEnv, since it will automatically be set. 

You can also check out the full API reference for [DjangoApplication](https://pennlabs.github.io/kittyhawk/interfaces/_lib_application_.djangoapplicationprops.html) and [ReactApplication](https://pennlabs.github.io/kittyhawk/interfaces/_lib_application_.reactapplicationprops.html).

### Properties for RedisApplication

RedisApplication accepts the same properties as Application, however some default values are different.
- tag (string) - version tag to use for redis  (**Optional**, defaults to '6.0')
- port (number) - Port exposed by the application. (**Optional**, defaults to 6379)

Additionally, the image is set to 'redis'.

### Cronjob

[Cronjob](lib/cronjob.ts) is the construct for deploying a cronjob. To create an cronjob, it must be passed a scope, name and a properties object containing a valid configuration. 
### Properties for Cronjob
You can find the full reference [here](https://pennlabs.github.io/kittyhawk/interfaces/_lib_cronjob_.cronjobprops.html). A summary of the properties is listed below:
- image (string) - Docker image to use. (**Required**)
- schedule (string) - The schedule to run the job at, in Cron format. Use the [cron-time-generator](https://www.npmjs.com/package/cron-time-generator) package to ensure that the cron schedule is written correctly.  (**Required**)
- restartPolicy (string) - [Policy](https://kubernetes.io/docs/concepts/workloads/controllers/job/#handling-pod-and-container-failures) for when the job should be restarted, either 'Always', 'OnFailure', or 'Never' (**Optional**, default 'Never')
- successLimit (number) - The number of successful finished jobs to retain. (**Optional**, default 1)
- failureLimit (number) - The number of failed jobs to retain. (**Optional**, default 1)

The following properties from Application are also available: ```tag, cmd, containerPort, extraEnv, livelinessProbe, port, pullPolicy, readinessProbe, replicas, secret, secretMounts```


## Escape Hatches

Escape Hatches are an advanced feature that allow for constructs to be modified after they are synthesized. Instructions can be found [here](https://github.com/awslabs/cdk8s/blob/master/docs/concepts/escape-hatches.md).