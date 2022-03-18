import { Construct } from "constructs";
import { Container, ContainerProps, SecretVolume } from "./container";
import { KubeCronJob as CronJobApiObject } from "./imports/k8s";
import { defaultChildName } from "./utils";

export interface CronJobProps extends ContainerProps {
  /**
   * The schedule in Cron format.
   */
  readonly schedule: string;

  /**
   * Restart policy for all containers.
   *
   * @default "Never"
   *
   */

  readonly restartPolicy?: "Always" | "OnFailure" | "Never";

  /**
   * The number of successful finished jobs to retain.
   *
   * @default 1
   *
   */
  readonly successLimit?: number;

  /**
   * The number of failed jobs to retain.
   *
   * @default 1
   *
   */
  readonly failureLimit?: number;

  /**
   * Secret volume mounts for cronjob container.
   *
   * @default undefined
   */
  readonly secretMounts?: {
    name: string;
    mountPath: string;
    subPath: string;
  }[];

  /**
   * Creates a service account and attach it to any deployment pods.
   * serviceAccountName: release name
   */
  readonly createServiceAccount?: boolean;
}

export class CronJob extends Construct {
  constructor(scope: Construct, jobname: string, props: CronJobProps) {
    super(scope, jobname);

    // We want to prepend the project name to the name of each component
    const release_name = process.env.RELEASE_NAME ?? "undefined_release";
    const fullname = `${release_name}-${jobname}`;
    const containers: Container[] = [
      new Container({
        ...props,
        noContainerPorts: true,
      }),
    ];

    new CronJobApiObject(this, defaultChildName, {
      metadata: {
        name: fullname,
        labels: { "app.kubernetes.io/name": fullname },
      },
      spec: {
        schedule: props.schedule,
        jobTemplate: {
          spec: {
            template: {
              spec: {
                ...(props.createServiceAccount
                  ? { serviceAccountName: release_name }
                  : {}),
                ...(props.secretMounts
                  ? {
                      volumes: props.secretMounts.map(
                        (m) => new SecretVolume(m)
                      ),
                    }
                  : {}),
                restartPolicy: props.restartPolicy ?? "Never",
                containers: containers,
              },
            },
          },
        },
        failedJobsHistoryLimit: props.failureLimit ?? 1,
        successfulJobsHistoryLimit: props.successLimit ?? 1,
      },
    });
  }
}
